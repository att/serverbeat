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


import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TagGraphService } from '../services/tag-graph.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectTreeService } from '../project-tree.service';
import { InteractionService } from '../services/interaction.service';
import { Observable } from 'rxjs';
import { ServerbeatUtil } from '@serverbeat/shared-lib';

@Component({
    selector: 'app-multi-tag-graph',
    templateUrl: './multi-tag-graph.component.html',
    styleUrls: ['./multi-tag-graph.component.css']
})
export class MultiTagGraphComponent implements OnInit, OnDestroy {
    crumbs;
    signalTagsAndSenders;
    
    displayedColumns = ['tag', 'senders', 'status', 'sla', 'See timeline'];
    availableViews : any;
    defaultView = 'detailed';
    tabViews = ['table', 'detailed', 'graph'];
    signalTagsAndSendersFilter = [];
    subs = [];
    private globalSubtags: any;

    selectedGlobalSubsection: string;

    // These two are only used for the data table; it might be a good idea to move the data table to its own component
    tagsToSendersAndAlerts: any;
    tags: string[];

    trafficLightFilter = {
        0: false,
        1: true,
        2: true,
        '-1': true
    };

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private tagGraphService: TagGraphService,
        private projectTreeService: ProjectTreeService,
        private interactionService: InteractionService
    ) {
        const sub = this.interactionService
            .getFilter()
            .subscribe((filters: any[]) => {
                console.log('received filters!', filters);
                this.signalTagsAndSendersFilter = filters;
            });
        this.subs.push(sub);
    }

    ngOnInit() {
        const projectId = this.route.snapshot.params.projectId;
        this.crumbs = this.route.snapshot.queryParamMap
            .get('crumbs')
            .split(',');
        if (this.route.snapshot.queryParamMap.has('filter')) {
            this.signalTagsAndSendersFilter = this.tagGraphService.deserTagsAndSenders(
                this.route.snapshot.queryParamMap.get('filter')
            );
        }
        this.signalTagsAndSenders = this.projectTreeService.getAllTagsAndSendersFromCrumbs(
            this.crumbs
        );
        this.globalSubtags = this.getGlobalSubtags();
        this.defaultView = this.projectTreeService.projectConfig.defaultView || this.defaultView;
        this.availableViews = this.projectTreeService.projectConfig.availableViews || this.tabViews;
        this.tagsToSendersAndAlerts = this.getTagsToSendersAndAlerts();
        this.tags = Object.keys(this.tagsToSendersAndAlerts);
    }

    private getTagsToSendersAndAlerts(): any {
        const dict = {};
        for (const tagAndSender of this.signalTagsAndSenders) {
            if (!(tagAndSender.tag in dict)) {
                dict[tagAndSender.tag] = {
                    senders: [tagAndSender.sender],
                    alert: this.tagGraphService.getTagAlert(
                        this.crumbs,
                        tagAndSender.tag
                    )
                };
            } else {
                dict[tagAndSender.tag].senders.push(tagAndSender.sender);
            }
        }
        return dict;
    }

    openTagWindow(tag: string) {
        const filter = [];
        for (const sender of this.tagsToSendersAndAlerts[tag].senders) {
            filter.push({ sender: sender, tag: tag });
        }
        this.signalTagsAndSendersFilter = filter;
        const filterStr = this.tagGraphService.serTagsAndSenders(
            this.signalTagsAndSendersFilter
        );
        const params = {
            filter: filterStr
        };
        this.router.navigate(['.'], {
            relativeTo: this.route,
            queryParams: params,
            queryParamsHandling: 'merge'
        });
    }

    backToProjectTree() {
        this.router.navigate([`..`], { relativeTo: this.route });
    }

    backToGraph() {
        this.router.navigate(['.'], {
            relativeTo: this.route,
            queryParams: { filter: null },
            queryParamsHandling: 'merge'
        });
        this.signalTagsAndSendersFilter = [];
    }

    ngOnDestroy(): void {
        for (const sub of this.subs) {
            sub.unsubscribe();
        }
    }

    private getGlobalSubtags() {
        const subtags = {};
        for (const tagAndSender of this.signalTagsAndSenders) {
            const subtagConfigs = this.tagGraphService.getSignalConfig(
                tagAndSender.tag
            ).subtagConfigs;
            subtagConfigs.forEach((el, idx) => {
                subtags[el.subtag] = el.displayName;
            });
        }
        return subtags;
    }

    goToSubsectionGlobal() {
        if (!this.selectedGlobalSubsection) {
            return;
        }
        this.interactionService.sendGlobalSubtag(this.selectedGlobalSubsection);
    }

    numberOfGraphs() {
        if (this.signalTagsAndSendersFilter.length === 0) {
            return this.signalTagsAndSenders.length;
        }
        return this.signalTagsAndSendersFilter.length;
    }

    matchedColorFilter(tag: string): boolean {
        const status = this.tagsToSendersAndAlerts[tag].alert.traffictLight;
        return this.trafficLightFilter[status];
    }

    humanizeSla(tag: string): string {
        const tagConfig = this.tagGraphService.getSignalConfig(tag);
        const slaStr = ServerbeatUtil.humanizeMinutes(tagConfig.signalSla);
        const toleranceStr = ServerbeatUtil.humanizeMinutes(
            tagConfig.signalTolerance
        );
        return `${slaStr} (+/-${toleranceStr})`;
    }
}
