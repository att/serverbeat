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


import {
    TimeagoModule,
    TimeagoFormatter,
    TimeagoClock,
    TimeagoPipe
} from 'ngx-timeago';
import { MatTooltipModule } from '@angular/material';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrafficLightComponent } from './traffic-light.component';
import { ServerbeatAlert } from '@serverbeat/shared-lib';

describe('TrafficLightComponent', () => {
    let component: TrafficLightComponent;
    let fixture: ComponentFixture<TrafficLightComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TrafficLightComponent],
            imports: [MatTooltipModule, TimeagoModule],
            providers: [
                TimeagoFormatter,
                TimeagoClock,
                {
                    provide: TimeagoPipe,
                    useValue: {
                        transform: function() {}
                    }
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TrafficLightComponent);

        fixture.componentInstance.alert = new ServerbeatAlert(
            -1,
            'test message',
            0
        );
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
