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


import { Component, Input, OnInit } from '@angular/core';
import * as shape from 'd3-shape';
import { TagGraphService } from '../services/tag-graph.service';
import { ActivatedRoute, Router } from '@angular/router';
import { InteractionService } from '../services/interaction.service';
import { ServerbeatUtil } from '@serverbeat/shared-lib';

@Component({
    selector: 'app-tag-dependency-display',
    templateUrl: './tag-dependency-display.component.html',
    styleUrls: ['./tag-dependency-display.component.css']
})
export class TagDependencyDisplayComponent implements OnInit {
    @Input() tagsAndSenders: any[];
    hierarchialGraph = { nodes: [], links: [] };
    // curve = shape.curveBundle.beta(1);
    curve = shape.curveLinear;
    // curve = shape.curveStepBefore;
    // curve = shape.curveStepAfter;
    graphReady = false;

    constructor(
        private readonly tagService: TagGraphService,
        private interactionService: InteractionService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.getGraphData();
    }

    nodeClicked(event) {
        console.log(event);
        this.interactionService.sendFilter(event.tagsAndSenders);

        const filterStr = this.tagService.serTagsAndSenders(
            event.tagsAndSenders
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

    private getAlertColor(tag: string) {
        const crumbs = this.route.snapshot.queryParamMap
            .get('crumbs')
            .split(',');
        const color = ServerbeatUtil.getCssColorForStatus(
            this.tagService.getTagAlert(crumbs, tag).traffictLight
        );
        console.log('tag', tag, 'color', color);
        return color;
    }

    private tagsToSenders(): any {
        const tagsToSenders = {};
        for (const el of this.tagsAndSenders) {
            if (el.tag in tagsToSenders) {
                tagsToSenders[el.tag].push(el.sender);
            } else {
                tagsToSenders[el.tag] = [el.sender];
            }
        }
        return tagsToSenders;
    }

    private reformatSender(sender: string): string {
        return sender.replace(/[\W_]+/g, '_');
    }

    // TODO: needs testing for multiple servers
    getGraphData() {
        const nodes = [];
        const links = [];
        const history = {};
        const fromTagsToSenders = this.tagsToSenders();
        for (const tagAndSender of this.tagsAndSenders) {
            const tagConfig = this.tagService.getSignalConfig(tagAndSender.tag);
            if (!(tagAndSender.tag in history)) {
                const tagsAndSendersFilter = [];
                for (const sender of fromTagsToSenders[tagAndSender.tag]) {
                    tagsAndSendersFilter.push({
                        sender: sender,
                        tag: tagAndSender.tag
                    });
                }
                nodes.push({
                    id: tagAndSender.tag,
                    label: `${tagConfig.signalDisplayName} (${
                        fromTagsToSenders[tagAndSender.tag].length
                    })`,
                    position: `${fromTagsToSenders[tagAndSender.tag].join(
                        ', '
                    )}`,
                    tagsAndSenders: tagsAndSendersFilter
                    // label: `${tagConfig.signalDisplayName}\n(${tagAndSender.sender})`,
                    // position: `${tagConfig.signalDescription} -- coming from sender: ${tagAndSender.sender}`
                });
                history[tagAndSender.tag] = 1;
            }

            for (const depTag of tagConfig.dependencies) {
                const weirdId = depTag + '__' + tagAndSender.tag;
                if (!(weirdId in history)) {
                    links.push({
                        source: depTag,
                        target: tagAndSender.tag,
                        label: 'has dependent'
                    });
                    history[weirdId] = 1;
                }
            }
        }
        this.hierarchialGraph.nodes = nodes;
        this.hierarchialGraph.links = links;
        console.log(this.hierarchialGraph);
        this.graphReady = true;
    }
}
