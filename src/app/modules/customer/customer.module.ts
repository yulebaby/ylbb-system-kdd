import { NgRelaxModule } from './../../ng-relax/ng-relax.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerComponent } from './customer/customer.component';
import { GetMobileDirective } from 'src/app/modules/customer/get-mobile.directive';
import { AddcustomerComponent } from './addcustomer/addcustomer.component';
import { RecordComponent } from './record/record.component';
import { JsonpModule } from '@angular/http';

@NgModule({
  imports: [
    CommonModule,
    CustomerRoutingModule,
    NgRelaxModule,
    JsonpModule
  ],
  declarations: [CustomerComponent, GetMobileDirective, AddcustomerComponent, RecordComponent],
  entryComponents: [AddcustomerComponent, RecordComponent]
})
export class CustomerModule { }
