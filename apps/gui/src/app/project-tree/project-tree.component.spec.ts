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


import { ServerbeatUtil, ServerbeatAlert } from '@serverbeat/shared-lib';

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProjectTreeService } from './../project-tree.service';
import { ProjectTreeComponent } from './project-tree.component';
import { TrafficLightComponent } from '../traffic-light/traffic-light.component';
import { EmptyLandingComponent } from '../empty-landing/empty-landing.component';
import { MultiTagGraphComponent } from '../multi-tag-graph/multi-tag-graph.component';
import { TagGraphComponent } from '../tag-graph/tag-graph.component';
import { TagDependencyDisplayComponent } from '../tag-dependency-display/tag-dependency-display.component';
import { IconsModule } from '../icons/icons.module';
import {
    MatTreeModule,
    MatIconModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatSelectModule,
    MatOptionModule,
    MatTableModule,
    MatRadioModule
} from '@angular/material';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgDygraphsModule } from 'ng-dygraphs';
import { TimeagoModule, TimeagoFormatter, TimeagoClock } from 'ngx-timeago';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

describe('ProjectTreeComponent', () => {
    let component: ProjectTreeComponent;
    let fixture: ComponentFixture<ProjectTreeComponent>;
    let location: Location;
    const demodata = [
        {
            name: 'a',
            tagsAndSenders: [
                {
                    sender: 'test.att.com',
                    tag: 'test-tag-a',
                    alerts: {
                        snapshot_check: ['hdfs_partitions', 'hive_partitions']
                    }
                }
            ],
            crumbs: ['test-crumb-a'],
            children: [
                {
                    name: 'g',
                    tagsAndSenders: ['test-tagAndSender-g'],
                    crumbs: ['test-crumb-a', 'test-crumb-g']
                },
                {
                    name: 'b',
                    children: [
                        {
                            name: 'e',
                            tagsAndSenders: ['test-tagAndSender-e'],
                            crumbs: [
                                'test-crumb-a',
                                'test-crumb-b',
                                'test-crumb-e'
                            ]
                        },
                        {
                            name: 'f',
                            tagsAndSenders: [
                                {
                                    sender: 'test.att.com',
                                    tag: 'test-tag-f',
                                    alerts: {
                                        snapshot_check: [
                                            'hdfs_partitions',
                                            'hive_partitions'
                                        ]
                                    }
                                }
                            ],
                            crumbs: [
                                'test-crumb-a',
                                'test-crumb-b',
                                'test-crumb-f'
                            ]
                        }
                    ],
                    tagsAndSenders: ['test-tagAndSender-b'],
                    crumbs: ['test-crumb-a', 'test-crumb-b']
                },
                {
                    name: 'c',
                    children: [
                        {
                            name: 'd',
                            tagsAndSenders: ['test-tagAndSender-d'],
                            crumbs: [
                                'test-crumbs-a',
                                'test-crumbs-c',
                                'test-crumbs-d'
                            ]
                        }
                    ],
                    tagsAndSenders: ['test-tagAndSender-c'],
                    crumbs: ['test-crumbs-a', 'test-crumbs-c']
                }
            ]
        }
    ];

    const alertData = {
        'test-crumb-a__CRUMB__test-crumb-b__CRUMB__test-crumb-f': {
            'test-tag-f': {
                traffictLight: -1,
                message: 'Test alert message from f',
                timestamp: 1562064000
            }
        },
        'test-crumb-a': {
            'test-tag-a': {
                traffictLight: -1,
                message: 'Test alert message from a',
                timestamp: 1562064000
            }
        }
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ProjectTreeComponent,
                TrafficLightComponent,
                EmptyLandingComponent,
                MultiTagGraphComponent,
                TagGraphComponent,
                TagDependencyDisplayComponent
            ],
            imports: [
                CommonModule,
                FormsModule,
                IconsModule,
                MatTreeModule,
                MatIconModule,
                MatTooltipModule,
                MatCheckboxModule,
                MatSelectModule,
                MatOptionModule,
                MatTableModule,
                MatRadioModule,
                NgxGraphModule,
                NgxChartsModule,
                NgDygraphsModule,
                TimeagoModule,
                NoopAnimationsModule,
                RouterTestingModule.withRoutes([
                    {
                        path: 'tags-and-senders',
                        component: MultiTagGraphComponent
                    }
                ]),
                HttpClientModule
            ],
            providers: [
                TimeagoFormatter,
                TimeagoClock,
                {
                    provide: ProjectTreeService,
                    useValue: {
                        treeData: [],
                        getServerbeatAlert: function(c: string[]) {
                            const crumbsStr = ServerbeatUtil.serCrumbs(c);
                            if (ServerbeatUtil.serCrumbs(c) in alertData) {
                                return alertData[crumbsStr] as ServerbeatAlert;
                            }
                            return ServerbeatAlert.createGrayAlert();
                        }
                    }
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTreeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('1. ProjectTreeComponent should be created.', () => {
        expect(component).toBeTruthy();
    });

    it('2. ProjectTreeComponent should display tree data with provided value.', () => {
        expect((component.dataSource.data = demodata)).toBeTruthy();
    });

    it('3. ProjectTreeComponent should work for goToCrumb and navigate to tags-and-sender route.', async(() => {
        fixture.ngZone.run(() => {
            component.goToCrumb(['test-crumbs']);
            location = TestBed.get(Location);
            fixture.whenStable().then(() => {
                expect(
                    location.path().indexOf('/tags-and-sender')
                ).toBeGreaterThan(-1);
            });
        });
    }));

    it('4. ProjectTreeComponent should work for goToCrumb with proper crumbs querry data.', async(() => {
        fixture.ngZone.run(() => {
            component.goToCrumb([
                'test-crumb-a',
                'test-crumb-b',
                'test-crumb-e'
            ]);
            location = TestBed.get(Location);
            fixture.whenStable().then(() => {
                expect(
                    location
                        .path()
                        .indexOf(
                            '/tags-and-senders?crumbs=test-crumb-a,test-crumb-b,test-crumb-e'
                        )
                ).toBeGreaterThan(-1);
            });
        });
    }));

    it('5. ProjectTreeComponent should execute getServerbeatAlert for root element with alert.', () => {
        expect(
            component.getServerbeatAlert(['test-crumb-a'])['test-tag-a'].message
        ).toBe('Test alert message from a');
    });

    it('6. ProjectTreeComponent should execute getServerbeatAlert for leaf element with alert.', () => {
        expect(
            component.getServerbeatAlert([
                'test-crumb-a',
                'test-crumb-b',
                'test-crumb-f'
            ])['test-tag-f'].message
        ).toBe('Test alert message from f');
    });

    it('7. ProjectTreeComponent should execute getServerbeatAlert for element with no alert.', () => {
        expect(component.getServerbeatAlert(['test-crumbs-a', 'test-crumbs-c']).message).toBe(
            'no alert is set (or executed) for this entity'
        );
    });
});
