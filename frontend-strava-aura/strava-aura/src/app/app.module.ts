import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LandingComponent } from './landing/landing.component';
import { ScoreRadarChartComponent } from './shared/score-radar-chart/score-radar-chart.component';
import { ScoreBarChartComponent } from './shared/score-bar-chart/score-bar-chart.component';

@NgModule({
  declarations: [AppComponent, HomeComponent, LandingComponent, ScoreRadarChartComponent, ScoreBarChartComponent],
  imports: [BrowserModule, BrowserAnimationsModule, AppRoutingModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
