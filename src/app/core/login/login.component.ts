import { NzModalService } from 'ng-zorro-antd';
import { RouterState } from '../reducers/router-reducer';
import { AppState } from '../reducers/reducers-config';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

declare const CryptoJS;

@Component({
  selector: 'ea-login',
  template: ''
})
export class LoginComponent implements OnInit {


  private baseRouter: RouterState;


  constructor(
    private router     : Router,
    private store      : Store<AppState>,
  ) {
    store.select('routerState').subscribe( res => this.baseRouter = res);
  }

  ngOnInit() {
    window.document.title = '鱼乐贝贝客多多-登录';
    let userInfo = {name: '管理员', id: 1};
    window.localStorage.setItem('userInfo', JSON.stringify(userInfo));
    this.router.navigateByUrl(this.baseRouter.loginSource || '/home');
  }


}
