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
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit
} from '@angular/core';
import { ServerbeatUtil } from '@serverbeat/shared-lib';
import { TimeagoPipe } from 'ngx-timeago';
import { ServerbeatAlert } from '@serverbeat/shared-lib';

@Component({
    selector: 'app-traffic-light',
    templateUrl: './traffic-light.component.html',
    styleUrls: ['./traffic-light.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [TimeagoPipe]
})
export class TrafficLightComponent implements OnInit {
    @Input() alert: ServerbeatAlert;
    @Input() cssSize = '12px';
    @Input() rectangular = false;
    cssColor: string;

    constructor(
        private timeAgoPipe: TimeagoPipe,
        private changeDetector: ChangeDetectorRef
    ) {}

    ngOnInit() {
        if (!this.cssColor) {
            if (this.alert.traffictLight in ServerbeatUtil.AlertCssColors) {
                this.cssColor =
                    ServerbeatUtil.AlertCssColors[this.alert.traffictLight];
            } else {
                if (!this.alert.message) {
                    this.alert.message =
                        'No alerts are set (or executed yet) for this entity';
                }
                this.cssColor = ServerbeatUtil.NoAlertColor;
            }
        }
    }

    getTrafficLightStyle() {
        let style;
        if (this.rectangular) {
            style = {
                'background-color': this.cssColor,
                width: '4px',
                height: this.cssSize
            };
        } else {
            style = {
                'background-color': this.cssColor,
                width: this.cssSize,
                height: this.cssSize,
                'border-radius': this.cssSize
            };
        }

        console.log(style);
        return style;
    }

    getTooltipMessage(): string {
        let msg = '';
        if (this.alert.timestamp) {
            msg = this.timeAgoPipe.transform(this.alert.timestamp * 1000);
        }
        if (this.alert.message) {
            if (msg) {
                msg = `${this.alert.message} (${msg})`;
            } else {
                msg = `${this.alert.message}`;
            }
        }
        return msg;
    }
}
