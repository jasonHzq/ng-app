import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { BrowserModule } from '@angular/platform-browser';
import { CounterComponent } from './counter.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [CounterComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: CounterComponent }])
  ]
})
export class CounterModule {}
