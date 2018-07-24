import { HttpService } from 'src/app/ng-relax/services/http.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-addcustomer',
  templateUrl: './addcustomer.component.html',
  styleUrls: ['./addcustomer.component.scss']
})
export class AddcustomerComponent implements OnInit {

  formModel: FormGroup;

  addressItems: any[] = [];
  shopItems: any[] = [];
  sourceItems: any[] = [];

  constructor(
    private fb: FormBuilder = new FormBuilder(),
    private http: HttpService
  ) { 
    this.formModel = this.fb.group({
      secondName: [],
      parentPhone: [, [Validators.required, Validators.pattern(/^1[3|5|7|8][0-9]\d{8}$/)], [this.parentPhoneAsyncValidator]],
      address: [],
      province: [],
      city: [],
      area: [],
      shopId: [],
      customerSpreadRelationId: [, [Validators.required]],
      activityPrice: [, [Validators.pattern(/(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/)]]
    });
    this.http.post(`/common/getAllProvinceCityArea`, {}, false).then(res => {
      this.addressItems = res || [];
    });
    this.http.post(`/common/selectSpreadRelations`, {} , false).then(res => {
      this.sourceItems = res.result || [];
    });
  }

  addressChanges(e) {
    if (e[0]) {
      this.http.post(`/common/findByShopObj`, {
        provinceCode: e[0],
        cityCode: e[1],
        areaCode: e[2]
      }, false).then(res => {
        if (res.code == 1000 && res.result.length) {
          this.shopItems = res.result;
        } else {
          this.shopItems = [{ id: null, shopName: '该城市下暂无门店' }]
        }
      })
    }
  }

  submit(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.formModel.valid) {
        let params = this.formModel.value;
        if (params.address && params.address.length) { 
          params.province = params.address[0];
          params.city = params.address[1];
          params.area = params.address[2];
        }
        for (let i in params) {
          params[i] === null && delete params[i];
        }
        this.http.post('/customerDetail/insert', params).then(res => {
          resolve(res);
        }, err => {
          reject(null);
        })
      } else {
        for (let i in this.formModel.controls) {
          this.formModel.controls[i].markAsDirty();
          this.formModel.controls[i].updateValueAndValidity();
        }
        reject(null);
      }
    })
  }

  ngOnInit() {
  }

  /* -------------------------- 手机号是否重复验证 ------------------------- */
  parentPhoneAsyncValidator = (control: FormControl): any => {
    return Observable.create((observer) => {
      this.http.post(`/customerDetail/selectParentPhone`, {
        parentPhone: control.value
      }, false).then(res => {
        if (res.code == 1000) {
          observer.next(null)
        } else {
          observer.next({ error: true, duplicated: true });
        }
        observer.complete();
      })
    })
  };

}
