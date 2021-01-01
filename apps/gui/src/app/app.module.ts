/*
 * The MIT License (MIT)
 *
 * Copyright 2020 AT&T Intellectual Property. All other rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { NgDygraphsModule } from 'ng-dygraphs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TimeagoClock, TimeagoModule, TimeagoPipe } from 'ngx-timeago';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TagGraphComponent } from './tag-graph/tag-graph.component';
import { IconsModule } from './icons/icons.module';
import { TagGraphDialogComponent } from './tag-graph-dialog/tag-graph-dialog.component';
import { MultiTagGraphComponent } from './multi-tag-graph/multi-tag-graph.component';
import { ProjectTreeComponent } from './project-tree/project-tree.component';
import { EmptyLandingComponent } from './empty-landing/empty-landing.component';
import { TagDependencyDisplayComponent } from './tag-dependency-display/tag-dependency-display.component';
import { TrafficLightComponent } from './traffic-light/traffic-light.component';
import { ServerbeatTimeagoClock } from './lib/serverbeat-timeago-clock';
import { AuthModule } from './modules/auth/auth.module';
import { GlobalErrorHandlerService } from './modules/auth/global-error-handler.service';

import {
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatRadioModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
    MatTabsModule,
    MatTreeModule
} from '@angular/material';
import { AuthInterceptor } from './modules/interceptor/auth-interceptor';

@NgModule({
    exports: [
        MatTooltipModule,
        MatSelectModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatTableModule,
        MatTreeModule,
        MatTabsModule,
        MatIconModule,
        MatRadioModule
    ]
})
export class MaterialModule {}

@NgModule({
    declarations: [
        AppComponent,
        TagGraphComponent,
        TagGraphDialogComponent,
        MultiTagGraphComponent,
        ProjectTreeComponent,
        EmptyLandingComponent,
        TagDependencyDisplayComponent,
        TrafficLightComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        NgDygraphsModule,
        NoopAnimationsModule,
        IconsModule,
        HttpClientModule,
        FormsModule,
        NgxGraphModule,
        NgxChartsModule,
        MaterialModule,
        TimeagoModule.forRoot({
            clock: { provide: TimeagoClock, useClass: ServerbeatTimeagoClock }
        }),
        AuthModule.forRoot(AuthModule.NO_AUTH)
    ],
    exports: [TagGraphDialogComponent, AuthModule],
    providers: [
        { provide: ErrorHandler, useClass: GlobalErrorHandlerService },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent],
    entryComponents: [TagGraphDialogComponent]
})
export class AppModule {}
