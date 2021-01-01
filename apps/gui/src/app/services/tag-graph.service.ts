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


import { Injectable } from '@angular/core';
import {
    ServerbeatAlert,
    ServerbeatTagConfig,
    SubtagType
} from '@serverbeat/shared-lib';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { TimeSeriesSignal } from '@serverbeat/shared-lib';
import { forkJoin } from 'rxjs';
import { ServerbeatUtil } from '@serverbeat/shared-lib';

@Injectable({
    providedIn: 'root'
})
export class TagGraphService {
    tagConfigs;
    private tagsAlerts: any;

    constructor(private http: HttpClient) {}

    private getTimestampsUrl(
        projectId: string,
        tag: string,
        subtag: string,
        sender: string,
        signalType: SubtagType
    ) {
        let endPoint = '';
        if (
            signalType === SubtagType.Single ||
            signalType === SubtagType.SingleWithSize
        ) {
            endPoint = 'single-signal-timestamps';
        } else if (
            signalType === SubtagType.Timeseries ||
            signalType === SubtagType.TimeseriesWithSize
        ) {
            endPoint = 'time-series-signal-timestamps';
        } else {
            throw new Error(`signal type [${signalType}] not supported!`);
        }
        let url = [
            environment.hostPort,
            'project',
            projectId,
            'tag',
            tag,
            'subtag',
            subtag,
            endPoint
        ].join('/');
        if (sender) {
            url += '?sender=' + sender;
        }
        return url;
    }

    private getTagConfigsUrl(projectId: string): string {
        const url = [
            environment.hostPort,
            'project',
            projectId,
            'tag-configs'
        ].join('/');
        return url;
    }

    private getTagsAlertsUrl(projectId: string): string {
        const url = [
            environment.hostPort,
            'project',
            projectId,
            'tree-tags-alerts'
        ].join('/');
        return url;
    }

    private getSingleTimeSeriesDataUrl(
        projectId: string,
        tag: string,
        subtag: string,
        timestamp: number,
        sender: string,
        signalType: SubtagType
    ) {
        let endPoint = '';
        if (
            signalType === SubtagType.Single ||
            signalType === SubtagType.SingleWithSize
        ) {
            endPoint = 'single-signal';
        } else if (
            signalType === SubtagType.Timeseries ||
            signalType === SubtagType.TimeseriesWithSize
        ) {
            endPoint = 'time-series-signal';
        } else {
            throw new Error('not supported!');
        }
        let url = [
            environment.hostPort,
            'project',
            projectId,
            'tag',
            tag,
            'subtag',
            subtag,
            endPoint,
            timestamp
        ].join('/');
        if (sender) {
            url += '?sender=' + sender;
        }
        return url;
    }

    private getTagsAndSendersUrl(projectId: string) {
        const url = [
            environment.hostPort,
            'project',
            projectId,
            'tags-and-senders'
        ].join('/');
        return url;
    }

    private getDetailedTagAlertsUrl(
        projectId: string,
        tag: string,
        sender: string,
        crumbs: string[]
    ) {
        let url = [
            environment.hostPort,
            'project',
            projectId,
            'tag',
            tag,
            'sender',
            sender,
            'detailed-tag-alerts'
        ].join('/');
        url += '?crumbsStr=' + ServerbeatUtil.serCrumbs(crumbs);
        return url;
    }

    public getTimestamps(
        projectId: string,
        tag: string,
        subtag: string,
        sender: string,
        signalType: SubtagType
    ): Promise<number[]> {
        return this.http
            .get<number[]>(
                this.getTimestampsUrl(
                    projectId,
                    tag,
                    subtag,
                    sender,
                    signalType
                )
            )
            .toPromise();
    }

    public initiateTags(projectId: string): Promise<any> {
        const calls = [
            this.http.get<any>(this.getTagConfigsUrl(projectId)),
            this.http.get(this.getTagsAlertsUrl(projectId))
        ];
        return forkJoin(calls)
            .toPromise()
            .then(r => {
                this.tagConfigs = {};
                for (const key in r[0]) {
                    this.tagConfigs[key] = ServerbeatTagConfig.fromJson(
                        r[0][key]
                    );
                }
                this.tagsAlerts = r[1];
            });
    }

    public serTagsAndSenders(tagsAndSenders: any[]): string {
        return tagsAndSenders
            .map(el => {
                return el.tag + ':' + el.sender;
            })
            .join(';');
    }

    public deserTagsAndSenders(str: string): any[] {
        const tagsAndSenders = [];
        str.split(';').forEach(el => {
            tagsAndSenders.push({
                tag: el.split(':')[0],
                sender: el.split(':')[1]
            });
        });
        return tagsAndSenders;
    }

    public getDetailedTagAlerts(
        projectId: string,
        tag: string,
        sender: string,
        crumbs: string[]
    ): Promise<any> {
        const crumbsStr = ServerbeatUtil.serCrumbs(crumbs);
        return this.http
            .get(this.getDetailedTagAlertsUrl(projectId, tag, sender, crumbs))
            .toPromise();
    }

    public getSingleTimeSeriesData(
        projectId: string,
        tag: string,
        subtag: string,
        timestamp: number,
        sender: string,
        signalType: SubtagType
    ): Promise<TimeSeriesSignal> {
        return this.http
            .get<TimeSeriesSignal>(
                this.getSingleTimeSeriesDataUrl(
                    projectId,
                    tag,
                    subtag,
                    timestamp,
                    sender,
                    signalType
                )
            )
            .toPromise()
            .then(data => {
                return TimeSeriesSignal.fromJson(data);
            });
    }

    public getTagsAndSenders(projectId: string): Promise<any[]> {
        return this.http
            .get<any[]>(this.getTagsAndSendersUrl(projectId))
            .toPromise()
            .then(data => {
                // no mainpulations for now:
                return data;
            });
    }

    public getSignalConfig(signalTag: string): ServerbeatTagConfig {
        // console.log('fetched tagConfigs', this.tagConfigs);
        if (signalTag in this.tagConfigs) {
            const signalConfig = this.tagConfigs[
                signalTag
            ] as ServerbeatTagConfig;
            console.log('type is:', signalConfig.constructor.name);
            return this.tagConfigs[signalTag] as ServerbeatTagConfig;
        }
        throw new Error(`can't find config for tag${signalTag}`);
    }

    getTagAlert(crumbs: string[], tag: string): ServerbeatAlert {
        // console.log('tagsAlerts', this.tagsAlerts);
        // console.log('crumbs', crumbs);
        // console.log('tag', tag);
        const crumbsStr = ServerbeatUtil.serCrumbs(crumbs);
        // console.log('crumbsStr', crumbsStr);
        if (crumbsStr in this.tagsAlerts && tag in this.tagsAlerts[crumbsStr]) {
            return this.tagsAlerts[crumbsStr][tag] as ServerbeatAlert;
        }
        return ServerbeatAlert.createGrayAlert();
    }
}
