import { NzMessageService } from 'ng-zorro-antd';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { HttpService } from 'src/app/ng-relax/services/http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { Jsonp } from '@angular/http';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

declare const window: any;

@Component({
  selector: "app-record",
  templateUrl: "./record.component.html",
  styleUrls: ["./record.component.scss"]
})
export class RecordComponent implements OnInit {
  erpDomain = "http://swx.beibeiyue.com/ylbb_weixin";

  @Input() userInfo;

  formModel: FormGroup;

  addressItems: any[] = [];
  shopItems: any[] = [];
  precontractItems: any[] = [];

  constructor(
    private http: HttpService,
    private httpClient: HttpClient,
    private fb: FormBuilder = new FormBuilder(),
    private format: DatePipe,
    private jsonp: Jsonp,
    private message: NzMessageService
  ) {
    window.callback = value => {
      console.log(value);
    };
    this.formModel = this.fb.group({
      secondName: [],
      birthday: [],
      visitInfo: [],
      address: [],
      shopId: [],
      reserveDate: [],
      precontract: [],
      remark: [],
      selectType: [0]
    });
    this.http.post(`/common/getAllProvinceCityArea`, {}, false).then(res => {
      this.addressItems = res || [];
    });

    /* ------------------------- 预约日期改变,置空时间段 ------------------------- */
    this.formModel.get("reserveDate").valueChanges.subscribe(res => {
      if (res) {
        this.http
          .post(
            this.erpDomain + `/reserve/listHoursForKedd`,
            {
              paramJson: JSON.stringify({
                date: this.format.transform(res, "yyyy-MM-dd"),
                storeId: this.formModel.get("shopId").value,
                birthday: this.format.transform(
                  this.formModel.get("birthday").value,
                  "yyyy-MM-dd"
                )
              })
            },
            false
          )
          .then(res => {
            if (res.code == 1000) {
              let options = res.result.list.map(res => {
                res = {
                  label: `${res.hour}:${res.minute}`,
                  value: `${res.hour}:${res.minute}`,
                  status: res.flag != "true"
                };
                return res;
              });
              this.precontractItems = options;
            } else {
              this.precontractItems = [{ label: "没有可预约时间", value: -1 }];
            }
          });
      }
    });

    /* --------------------------- 省市区改变,置空门店 --------------------------- */
    this.formModel.get("address").valueChanges.subscribe(e => {
      if (this.formModel.get("selectType").value == 0) {
        this.formModel.patchValue({ shopId: null });
        if (e[0] && this.formModel.get("selectType").value == 0) {
          this.http
            .post(
              `/common/findByShopObj`,
              {
                provinceCode: e[0],
                cityCode: e[1],
                areaCode: e[2]
              },
              false
            )
            .then(res => {
              if (res.code == 1000 && res.result.length) {
                this.shopItems = res.result;
              } else {
                this.shopItems = [{ id: null, shopName: "该城市下暂无门店" }];
              }
            });
        } else {
          this.shopItems = [];
        }
      }
    });

    /* ------------------- 选择门店方式改变，重新给inputValue赋值 ------------------- */
    this.formModel.get("selectType").valueChanges.subscribe(e => {
      typeof this.inputValue == "object" &&
        (this.inputValue = this.inputValue.name);
    });
    /* --------------------------- 所属门店改变,重置省市区 --------------------------- */
    this.formModel.get("shopId").valueChanges.subscribe(e => {
      if (this.formModel.get("selectType").value != 0) {
        this.shopItems.map(res => {
          if (res.id === e) {
            this.formModel.patchValue({
              address: [res.provinceCode, res.cityCode, res.areaCode]
            });
          }
        });
      }
      typeof this.inputValue == "object" &&
        (this.inputValue = this.inputValue.name);
    });
  }

  /* -------------------------- 宝宝生日改变,置空预约时间 -------------------------- */
  birthdayChange(e) {
    !e && this.formModel.patchValue({ reserveDate: null, precontract: null });
  }

  submit(): Promise<any> {
    return new Promise((resolve, reject) => {
      const params = JSON.parse(JSON.stringify(this.formModel.value));
      params.reserveDate = this.format.transform(
        this.formModel.get("reserveDate").value,
        "yyyy-MM-dd"
      );
      params.birthday = this.format.transform(
        this.formModel.get("birthday").value,
        "yyyy-MM-dd"
      );
      params.reserveHour = params.precontract
        ? params.precontract.split(":")[0]
        : "";
      params.reserveMinute = params.precontract
        ? params.precontract.split(":")[1]
        : "";
      params.province = params.address ? params.address[0] : "";
      params.city = params.address ? params.address[1] : "";
      params.area = params.address ? params.address[2] : "";
      params.customerBabyId = this.userInfo.customerBabyId;
      params.id = this.userInfo.id;
      for (let i in params) {
        params[i] === null && delete params[i];
      }
      if (params.precontract) {
        this.http
          .post(
            "/customerDetail/findByParentPhone",
            { customerBabyId: this.userInfo.customerBabyId },
            false
          )
          .then(res => {
            if (res.code == 1000) {
              this.http.post(this.erpDomain + "/reserve/kddReserveFei", {
                paramJson: JSON.stringify({
                  birthday: params.birthday,
                  date: params.reserveDate,
                  storeId: params.shopId,
                  hour: params.reserveHour,
                  minute: params.reserveMinute,
                  userPhone: res.result,
                  nickName: params.secondName,
                  comment: params.remark,
                  payMoney: typeof this.userInfo.activityPrice === 'number' ? this.userInfo.activityPrice + '' : ''
                })
              });
            }
          });
      }
      this.http
        .post("/customerDetail/updateCustomerPrecontractInfo", params)
        .then(res => resolve(true), err => reject(false));
    });
  }

  /* ------------------------- 宝宝生日、预约时间，选择限制 ------------------------- */
  disabledStartDate = (startValue: Date): boolean => {
    if (!startValue) {
      return false;
    }
    return startValue.getTime() > new Date().getTime();
  };
  disabledEndDate = (endValue: Date): boolean => {
    if (!endValue) {
      return false;
    }
    return endValue.getTime() < new Date().getTime() - 1000 * 60 * 24;
  };

  /* ------------------------- 请求防抖 ------------------------- */
  search$: Observable<any[]>;
  private searchText$ = new Subject<string>();
  ngOnInit() {
    /* ------------------------- 回显------------------------- */
    this.userInfo.address = this.userInfo.provinceCode
      ? [
          this.userInfo.provinceCode,
          this.userInfo.cityCode,
          this.userInfo.areaCode
        ]
      : [];
    this.formModel.patchValue(this.userInfo);
    setTimeout(_ => {
      this.formModel.patchValue({ shopId: this.userInfo.shopId });
    });

  }

  requestNum: number = 0;
  allowRequest = 600;
  addressRequest: any;
  bdResult: any[];
  inputValue;

  addressChange(e) {
    clearTimeout(this.addressRequest);
    this.addressRequest = setTimeout(() => {
      window.jsonpCallback = value => {
        this.bdResult = value.results || [];
      };
      let script = document.createElement("script");
      let url = `https://api.map.baidu.com/place/v2/search?query=${e}&region=北京&output=json&ak=7NCxWo3ADYmuEiFY8GM4SW9yxoNGSnLG&callback=jsonpCallback`;
      script.setAttribute("src", url);
      document.getElementsByTagName("head")[0].appendChild(script);
      script.onload = function() {
        script.remove();
      };
    }, this.allowRequest);
  }

  searchShop() {
    if (typeof this.inputValue == "object") {
      this.getSearchShopItems(this.inputValue.location);
    } else {
      window.jsonpLocationCallback = (value) => {
        if (value.status == 0) {
          this.getSearchShopItems(value.result.location);
        }
      }
      let script = document.createElement("script");
      let url = `http://api.map.baidu.com/geocoder/v2/?address=${this.inputValue}&output=json&ak=7NCxWo3ADYmuEiFY8GM4SW9yxoNGSnLG&callback=jsonpLocationCallback`;
      script.setAttribute("src", url);
      document.getElementsByTagName("head")[0].appendChild(script);
      script.onload = function () {
        script.remove();
      };
    }
  }

  getSearchShopItems(obj) {
    this.httpClient
      .post<any>(
        this.erpDomain + "/shop/listShopForKeduoduo",
        `paramJson=${JSON.stringify({
          lat: obj.lat,
          lon: obj.lng
        })}`,
        {
          headers: new HttpHeaders().set(
            "Content-Type",
            "application/x-www-form-urlencoded; charset=UTF-8"
          )
        }
      )
      .subscribe(res => {
        res.code == 1000 && (this.shopItems = res.result);
      });
  }
}

