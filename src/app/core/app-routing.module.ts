import { AuthGuardService } from '../ng-relax/services/auth-guard.service';
import { UserInfoResolver } from './userInfo-resolver.service';
import { BaseComponent } from '../base/base.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'home',
    component: BaseComponent,
    resolve: { userInfo: UserInfoResolver },
    children: [
      
    ]
  },
  {
    path: 'system',
    data: { title: '系统管理' },
    loadChildren: 'src/app/modules/system/system.module#SystemModule'
  },
  {
    path: '**',
    redirectTo: '/system/error/404',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
