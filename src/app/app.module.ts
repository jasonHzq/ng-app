import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector, NgModuleFactoryLoader } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { WebpackDllNgModuleLoader } from 'webpack-dll-ng-module-loader';

@NgModule({
  declarations: [AppComponent],
  imports: [
    HttpClientModule,
    HttpClientJsonpModule,
    BrowserModule,
    RouterModule.forRoot([
      {
        path: '',
        loadChildren: './counter/counter.module#CounterModule'
      }
    ])
  ],
  providers: [
    { provide: NgModuleFactoryLoader, useClass: WebpackDllNgModuleLoader }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
