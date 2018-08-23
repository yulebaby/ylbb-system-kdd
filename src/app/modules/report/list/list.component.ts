import { DatePipe } from '@angular/common';
import { CacheService } from './../../../ng-relax/services/cache.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpService, serialize } from './../../../ng-relax/services/http.service';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  queryForm: FormGroup;

  shopItems: any[] = [];
  spreadItems: any[] = [];

  provinceItems: any[] = [];
  cityItems: any[] = [];
  areaItems: any[] = [];

  constructor(
    private http: HttpService,
    private fb: FormBuilder = new FormBuilder(),
    private cache: CacheService,
    private format: DatePipe
  ) {
    this.queryForm = this.fb.group({
      province: [[]],
      city: [[]],
      area: [[]],
      shopId: [],
      createTime: [],
      spreadId: []
    });

    this.queryForm.get('province').valueChanges.subscribe(res => {
      if (res && res.length) {
        this.cityItems = [];
        this.provinceItems.map(address => {
          if (res.indexOf(address.value) > -1) {
            this.cityItems = this.cityItems.concat(address.children);
          }
        })
      }
    });
    this.queryForm.get('city').valueChanges.subscribe(res => {
      if (res && res.length) {
        this.areaItems = [];
        this.cityItems.map(address => {
          if (res.indexOf(address.value) > -1) {
            this.areaItems = this.areaItems.concat(address.children);
          }
        })
      }
    });

    this.http.post('/common/getAllProvinceCityArea', {}, false).then(res => this.provinceItems = res.result);
    this.cache.get('/common/selectSpreadRelations').subscribe(res => this.spreadItems = res);
    this.cache.get('/common/findByShopObj').subscribe(res => this.shopItems = res);
  }

  ngOnInit() {
  }
  
  query(table) {
    let params = this.queryForm.value;
    params.province = params.province.length ? params.province.join(',') : '';
    params.city = params.city.length ? params.city.join(',') : '';
    params.area = params.area.length ? params.area.join(',') : '';
    params.createStartTime = params.createTime && params.createTime.length ? this.format.transform(params.createTime[0], 'yyyy-mm-dd') : '';
    params.createEndTime = params.createTime && params.createTime.length ? this.format.transform(params.createTime[1], 'yyyy-mm-dd') : '';
    delete params.createTime;
    table.request(params);
  }

  reset() {}


  domain = environment.domain
  export() {
    let params = this.queryForm.value;
    console.log(params)
    params.province = params.province.length ? params.province.join(',') : '';
    params.city = params.city.length ? params.city.join(',') : '';
    params.area = params.area.length ? params.area.join(',') : '';
    params.createStartTime = params.createTime && params.createTime.length ? this.format.transform(params.createTime[0], 'yyyy-mm-dd') : '';
    params.createEndTime = params.createTime && params.createTime.length ? this.format.transform(params.createTime[1], 'yyyy-mm-dd') : '';
    window.open(`${this.domain}/shopInfo/exportShopInfo?${serialize(params)}`, '_blank')
  }
}
