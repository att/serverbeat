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


import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagGraphComponent } from './tag-graph.component';
import { TrafficLightComponent } from '../traffic-light/traffic-light.component';
import {
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    MatTooltipModule,
    MatCheckboxModule,
    MAT_DIALOG_DATA,
    MatDialog
} from '@angular/material';
import { NgDygraphsModule } from 'ng-dygraphs';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IconsModule } from '../icons/icons.module';
import { RouterTestingModule } from '@angular/router/testing';
import { TimeagoModule } from 'ngx-timeago';
import { TagGraphService } from '../services/tag-graph.service';

describe('TagGraphComponent', () => {
    let component: TagGraphComponent;
    let fixture: ComponentFixture<TagGraphComponent>;
    const subTagConfigData = [
        {
            subtagType: 'time_series',
            subtag: 'hdfs_partitions',
            displayName: 'HDFS Partitions',
            isDefault: false,
            drawMissing: true
        },
        {
            subtagType: 'time_series',
            subtag: 'hive_partitions',
            displayName: 'Hive Partitions',
            isDefault: true,
            drawMissing: true
        },
        {
            subtagType: 'time_series_with_size',
            subtag: 'hdfs_size',
            displayName: 'HDFS File Size',
            isDefault: false,
            drawMissing: false
        }
    ];

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TagGraphComponent, TrafficLightComponent],
            imports: [
                MatFormFieldModule,
                NgDygraphsModule,
                MatSelectModule,
                MatRadioModule,
                FormsModule,
                MatTooltipModule,
                MatCheckboxModule,
                HttpClientModule,
                IconsModule,
                RouterTestingModule.withRoutes([]),
                TimeagoModule
            ],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialog, useValue: {} },
                {
                    provide: TagGraphService,
                    useValue: {
                        getTagAlert: function() {
                            return [];
                        },
                        getSignalConfig: function() {
                            return {
                                subtagConfigs: subTagConfigData,
                                getDefaultSubtag: function() {
                                    return { subtag: 'hdfs_partitions' };
                                }
                            };
                        },
                        getTimestamps: function() {
                            return new Promise(() => {
                                return 100;
                            });
                        }
                    }
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TagGraphComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
