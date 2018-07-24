import { RecordComponent } from './../record/record.component';
import { AddcustomerComponent } from './../addcustomer/addcustomer.component';
import { HttpClient } from '@angular/common/http';
import { QueryNode } from 'src/app/ng-relax/components/query/query.component';
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { TableComponent } from '../../../ng-relax/components/table/table.component';
@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit {

  queryNode: QueryNode[] = [
    {
      label       : '家长电话',
      key         : 'parentPhone',
      type        : 'input'
    },
    {
      label       : '宝宝昵称',
      key         : 'secondName',
      type        : 'input'
    },
    {
      label       : '填写日期',
      key         : 'createTime',
      type        : 'rangepicker',
      valueKey    : ['filloutStartDate', 'filloutEndDate']
    },
    {
      label       : '活动价格',
      key         : 'activityPrice',
      type        : 'input',
      isHide      : true
    },
    {
      label       : '所属门店',
      key         : 'shopId',
      type        : 'select',
      optionKey   : { label: 'shopName', value: 'id'},
      optionsUrl  : '/common/findByShopObj',
    },
    {
      label       : '客户来源',
      key         : 'customerSpreadRelationId',
      type        : 'select',
      optionsUrl  : '/common/selectSpreadRelations',
    },
    {
      label       : '预约日期',
      key         : 'createxxTime',
      type        : 'rangepicker',
      valueKey    : ['preStartDate', 'preEndDate'],
      isHide      : true
    },
    {
      label       : '跟踪时间',
      key         : 'createxxxxTime',
      type        : 'rangepicker',
      valueKey    : ['visitStartDate', 'visitEndDate'],
      isHide      : true
    },
    {
      label       : '状态',
      key         : 'stage',
      type        : 'select',
      options     : [
                  { id: 0, name: '新用户' },
                  { id: 1, name: '首次跟踪' },
                  { id: 2, name: '二次跟踪' },
                  { id: 3, name: '已预约' },
                  { id: 4, name: '已分配' },
                  { id: 5, name: '已体验' },
                  { id: 6, name: '已办卡' }
                ],
      placeholder : '请选择状态',
      isHide      : true
    },
  ];

  tableNode = [{ name: '家长电话', width: 100, left: 0 }, '宝宝昵称', '客户来源', '转化数', '省市区', '归属门店', '入库时间', '状态', '预约日期', { name: '操作', width: 100, right: 0}]

  constructor(
    private message: NzMessageService,
    private httpClient: HttpClient,
    private modal : NzModalService,
  ) { }

  ngOnInit() { }

  @ViewChild('tplContent') tplContent: TemplateRef<any>;
  failItems: any[]= [];
  upExcel(excelDome): void {
    const file = excelDome.files[0];
    if (file) {
      let message = this.message.loading('导入中, 请稍后').messageId;
      let formData = new FormData();
      formData.set('filename', file);
      this.httpClient.post(`/batchImport/batchImportUserKnowledge`, formData).subscribe(res => {
        this.message.remove(message);
        this.EaTable._request();
        if (res['code'] == 1000) {
          this.message.success('批量导入用户信息成功');
        } else {
          this.failItems = res['result'];
          this.modal.create({
            nzWidth: 720,
            nzTitle: `以下数据上传失败（${this.failItems.length}）`,
            nzContent: this.tplContent,
            nzFooter: null
          });
        }
      });
    }
  }

  @ViewChild('EaTable') EaTable: TableComponent;
  addCustomerInfo() {
    let _this_ = this;
    const modal = this.modal.create({
      nzTitle: '新增客户',
      nzContent: AddcustomerComponent,
      nzFooter: [{
        label: '取消',
        onClick: (componentInstance) => {
          modal.close();
        }
      },{
        label: '确定',
        type: 'primary',
        loading: false,
        onClick(componentInstance) {
          this.loading = true;
          componentInstance.submit().then(res => {
            modal.close();
            this.loading = false;
            _this_.EaTable._request();
          }, err => {
            this.loading = false;
          })
        }
      }]
    });
  }

  record(data) {
    let _this_ = this;
    const modal = this.modal.create({
      nzTitle: '修改客户',
      nzContent: RecordComponent,
      nzComponentParams: { userInfo: data },
      nzFooter: [{
        label: '取消',
        onClick: (componentInstance) => {
          modal.close();
        }
      }, {
        label: '确定',
        type: 'primary',
        loading: false,
        onClick(componentInstance) {
          this.loading = true;
          componentInstance.submit().then(res => {
            modal.close();
            this.loading = false;
            _this_.EaTable._request();
          }, err => {
            this.loading = false;
          })
        }
      }]
    });
  }

}