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
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { DataPoint, TimeSeriesSignal } from '@serverbeat/shared-lib';
import { TagGraphService } from '../services/tag-graph.service';
import { DygraphUtil } from '../lib/dygraph-util';
import { MatDialog } from '@angular/material';
import { ServerbeatUtil } from '@serverbeat/shared-lib';
import { ActivatedRoute, Router } from '@angular/router';
import {
    ServerbeatAlert,
    ServerbeatSubtagConfig,
    ServerbeatTagConfig
} from '@serverbeat/shared-lib';
import { InteractionService } from '../services/interaction.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-tag-graph',
    templateUrl: './tag-graph.component.html',
    styleUrls: ['./tag-graph.component.css']
})
export class TagGraphComponent implements OnInit, OnDestroy {
    @Input() signalTag: string;
    @Input() subtag: string;
    @Input() signalSender = '';

    projectId;

    dygraphUtil: DygraphUtil;
    signalConfig: ServerbeatTagConfig;
    subtagConfig: ServerbeatSubtagConfig;
    availableTimestamps: number[] = [];
    selectedTimestamp: number;
    displayedTimestamp: number;

    tagAlert: ServerbeatAlert;
    subtagAlerts: any;

    autoRefresh = true;
    autoRefreshInterval = null;

    subs = [];

    @ViewChild('dyGraphComponent', { static: false }) dyGraphComponent;

    constructor(
        private tagGraphService: TagGraphService,
        private dialog: MatDialog,
        private router: Router,
        private route: ActivatedRoute,
        private changeDetector: ChangeDetectorRef,
        private interactionService: InteractionService
    ) {
        const sub = this.interactionService
            .getGlobalSubtag()
            .subscribe((subtag: string) => {
                if (this.signalConfig && this.signalConfig.hasSubtag(subtag)) {
                    this.radioClicked(subtag);
                }
            });
        this.subs.push(sub);
    }
    ngOnInit() {
        if (!this.signalTag) {
            this.signalTag = this.route.snapshot.params.tag;
        }
        if (!this.signalSender) {
            this.signalSender = this.route.snapshot.queryParamMap.get('sender');
        }
        this.projectId = this.route.snapshot.params.projectId;
        this.signalConfig = this.tagGraphService.getSignalConfig(
            this.signalTag
        );
        console.log('this.signalConfig', this.signalConfig);

        if (this.route.snapshot.queryParamMap.has('subtag')) {
            this.subtag = this.route.snapshot.queryParamMap.get('subtag');
            this.subtagConfig = this.signalConfig.getSubtagConfig(this.subtag);
        } else {
            this.subtagConfig = this.signalConfig.getDefaultSubtag();
            this.subtag = this.subtagConfig.subtag;
        }

        if (!this.signalConfig) {
            console.warn('no signal config for: ', this.signalTag);
            return;
        }

        this.tagGraphService
            .getTimestamps(
                this.projectId,
                this.signalTag,
                this.subtagConfig.subtag,
                this.signalSender,
                this.subtagConfig.subtagType
            )
            .then((timestamps: number[]) => {
                this.availableTimestamps = timestamps;
                this.recreateDygraphs(null, this.subtagConfig.subtag);
                if (this.autoRefresh) {
                    this.enableAutoRefreshInterval();
                }
            });
    }

    private autoRefreshFunc(outerThis) {
        // TODO: needs review it seems
        // outerThis.tagGraphService.getTimestamps(outerThis.projectId, outerThis.signalTag).then(
        //     (timestamps: number[]) => {
        //         outerThis.availableTimestamps = timestamps;
        //         if (timestamps.length === 0) {
        //             return;
        //         }
        //         const lastTs = timestamps[timestamps.length - 1];
        //
        //         if (lastTs === outerThis.displayedTimestamp) {
        //             return;
        //         }
        //         if (outerThis.displayedTimestamp !== lastTs) {
        //             outerThis.recreateDygraphs();
        //         }
        //     }
        // );
    }

    private enableAutoRefreshInterval() {
        if (this.autoRefreshInterval !== null) {
            throw new Error('double enabling auto-refresh-interval');
        }
        this.autoRefreshInterval = setInterval(
            this.autoRefreshFunc,
            this.getAutoRefreshMinutes() * 60 * 1000,
            this
        );
        console.log('enable auto refresh');
    }

    private disableAutoRefreshInterval() {
        if (this.autoRefreshInterval === null) {
            throw new Error('auto-refresh-interval was not enabled');
            return;
        }
        clearInterval(this.autoRefreshInterval);
        this.autoRefreshInterval = null;
        console.log('disable auto refresh');
    }

    autoRefreshClicked() {
        console.log(this.autoRefresh);
        if (this.autoRefresh) {
            this.disableAutoRefreshInterval();
        } else {
            this.enableAutoRefreshInterval();
        }
    }

    private recreateDygraphs(timestamp: number, subtag: string): void {
        if (this.availableTimestamps.length === 0) {
            return;
        }
        let lastTs;
        if (timestamp === null) {
            timestamp = this.availableTimestamps[
                this.availableTimestamps.length - 1
            ];
            if (this.subtagConfig.drawMissing) {
                lastTs = Math.round(new Date().getTime() / 1000);
            } else {
                lastTs = timestamp;
            }
            this.selectedTimestamp = null;
        } else {
            lastTs = timestamp;
        }

        this.displayedTimestamp = timestamp;
        this.subtagConfig = this.signalConfig.getSubtagConfig(subtag);

        // TODO: get rid of comma separated crumbs
        const crumbs = this.route.snapshot.queryParamMap
            .get('crumbs')
            .split(',');
        const calls = [
            this.tagGraphService.getSingleTimeSeriesData(
                this.projectId,
                this.signalTag,
                this.subtagConfig.subtag,
                this.displayedTimestamp,
                this.signalSender,
                this.subtagConfig.subtagType
            ),
            this.tagGraphService.getDetailedTagAlerts(
                this.projectId,
                this.signalTag,
                this.signalSender,
                crumbs
            )
        ];

        forkJoin(calls)
            .toPromise()
            .then(r => {
                const detailedAlerts = r[1];
                this.tagAlert = this.createTagAlert(detailedAlerts);
                this.subtagAlerts = this.createSubtagAlerts(detailedAlerts);

                const signal = r[0] as TimeSeriesSignal;
                if (this.subtagConfig.drawMissing) {
                    signal.fillInTheBlank(
                        this.signalConfig.signalFrequency,
                        this.signalConfig.signalTolerance,
                        this.signalConfig.signalSla,
                        this.signalConfig.signalCriticalWindow
                    );
                }
                this.dygraphUtil = null;
                this.changeDetector.detectChanges();
                this.dygraphUtil = new DygraphUtil(
                    this.signalTag,
                    this.subtagConfig.subtag,
                    this.subtagConfig.hasNumericValue(),
                    this.signalConfig.signalDisplayName,
                    lastTs,
                    this.signalConfig.signalSla,
                    this.signalConfig.signalCriticalWindow,
                    signal.dataPoints,
                    this.dialog
                );

                this.dygraphUtil.updateDateRange(
                    lastTs,
                    this.signalConfig.signalSla,
                    this.signalConfig.signalCriticalWindow
                );
                this.changeDetector.detectChanges();
            });
    }

    toReadableDateFormat(seconds: number) {
        return ServerbeatUtil.toReadableDateFormat(seconds, false);
    }

    updateRange(isNow: boolean) {
        if (isNow) {
            this.selectedTimestamp = null;
        }
        this.recreateDygraphs(this.selectedTimestamp, this.subtagConfig.subtag);

        // TODO: don't remove just for reference
        // this.dyGraphComponent._g.updateOptions({
        //     dateWindow: dateRange
        // });
    }

    private getAutoRefreshMinutes(): number {
        return this.signalConfig.signalFrequency / 2;
    }

    getAutoRefreshText(): string {
        return `if selected, the signal auto-refreshes every ${this.getAutoRefreshMinutes()} minutes`;
    }

    radioClicked(subtag) {
        this.subtag = subtag;
        this.subtagConfig = this.signalConfig.getSubtagConfig(subtag);
        this.tagGraphService
            .getTimestamps(
                this.projectId,
                this.signalTag,
                this.subtagConfig.subtag,
                this.signalSender,
                this.subtagConfig.subtagType
            )
            .then((timestamps: number[]) => {
                this.availableTimestamps = timestamps;
                this.recreateDygraphs(null, this.subtagConfig.subtag);
                if (this.autoRefresh) {
                    this.disableAutoRefreshInterval();
                    this.enableAutoRefreshInterval();
                }
            });
    }

    ngOnDestroy(): void {
        for (const sub of this.subs) {
            sub.unsubscribe();
        }
    }

    replaceQueryString(url, param, value): string {
        const re = new RegExp('([?|&])' + param + '=.*?(&|$)', 'i');
        if (url.match(re)) {
            return url.replace(re, '$1' + param + '=' + value + '$2');
        } else {
            return url + '&' + param + '=' + value;
        }
    }
    openTab() {
        console.log(this.router.url);
        let url = window.location.href;
        url = this.replaceQueryString(url, 'subtag', this.subtag);
        const senderStr = this.tagGraphService.serTagsAndSenders([
            { sender: this.signalSender, tag: this.signalTag }
        ]);
        url = this.replaceQueryString(url, 'filter', senderStr);
        return url;
    }

    createSubtagAlerts(detailedAlerts: any): any {
        const subtagAlerts = {};
        for (const subtagConfig of this.signalConfig.subtagConfigs) {
            if (subtagConfig.subtag in detailedAlerts) {
                subtagAlerts[subtagConfig.subtag] =
                    detailedAlerts[subtagConfig.subtag];
            } else {
                subtagAlerts[
                    subtagConfig.subtag
                ] = ServerbeatAlert.createGrayAlert();
            }
        }
        return subtagAlerts;
    }

    createTagAlert(detailedAlerts): ServerbeatAlert {
        const statuses = [];
        const messages = [];
        const timestamps = [];
        for (const subtag in detailedAlerts) {
            const alert = detailedAlerts[subtag] as ServerbeatAlert;
            const subtagConfig = this.signalConfig.getSubtagConfig(subtag);
            const msg = `${subtagConfig.displayName} (${
                subtagConfig.subtag
            }): ${alert.message}`;
            messages.push(msg);
            timestamps.push(alert.timestamp);
            statuses.push(alert.traffictLight);
        }
        if (messages.length) {
            return new ServerbeatAlert(
                Math.max.apply(null, statuses),
                messages.join(' ---- '),
                Math.min.apply(null, timestamps)
            );
        } else {
            return ServerbeatAlert.createGrayAlert();
        }
    }
}
