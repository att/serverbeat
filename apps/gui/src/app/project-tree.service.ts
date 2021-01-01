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
    ProjectTreeNode,
    ProjectTreeParseAction
} from '@serverbeat/shared-lib';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
    ServerbeatAlert,
    ServerbeatProjectConfig
} from '@serverbeat/shared-lib';
import { forkJoin } from 'rxjs';
import { ServerbeatUtil } from '@serverbeat/shared-lib';

@Injectable({
    providedIn: 'root'
})
export class ProjectTreeService {
    treeData;
    projectConfig: ServerbeatProjectConfig;
    private rawTree;
    private projectAlerts: any;

    getAllTagsAndSendersFromCrumbs(crumbs: string[]) {
        let curTree = this.rawTree;
        for (const crumb of crumbs) {
            curTree = curTree[crumb];
            console.log('crumb', crumb, 'curTree', curTree);
        }
        console.log('finalCurTree', curTree);
        const curTagsAndSenders = ProjectTreeNode.traverseTree(
            curTree,
            ProjectTreeParseAction.TAGS_AND_SENDERS
        );
        return curTagsAndSenders;
    }

    constructor(private http: HttpClient) {}

    private getProjectTreeUrl(projectId: string) {
        const url = [
            environment.hostPort,
            'project',
            projectId,
            'project-tree'
        ].join('/');
        return url;
    }

    private getProjectConfigUrl(projectId: string) {
        const url = [
            environment.hostPort,
            'project',
            projectId,
            'project-config'
        ].join('/');
        return url;
    }

    private getLeavesAlertsUrl(projectId: string) {
        const url = [
            environment.hostPort,
            'project',
            projectId,
            'tree-leaves-alerts'
        ].join('/');
        return url;
    }

    public getProjectTree(projectId: string): Promise<any> {
        const calls = [
            this.http.get(this.getProjectTreeUrl(projectId)),
            this.http.get(this.getProjectConfigUrl(projectId)),
            this.http.get(this.getLeavesAlertsUrl(projectId))
        ];
        return forkJoin(calls)
            .toPromise()
            .then(r => {
                this.rawTree = r[0];
                this.treeData = ProjectTreeNode.traverseTree(
                    this.rawTree,
                    ProjectTreeParseAction.TO_MATERIAL_TREE
                );
                this.projectConfig = r[1] as ServerbeatProjectConfig;
                this.projectAlerts = r[2] as any;
            });
    }

    getServerbeatAlert(crumbs: string[]): ServerbeatAlert {
        const crumbsStr = ServerbeatUtil.serCrumbs(crumbs);
        if (ServerbeatUtil.serCrumbs(crumbs) in this.projectAlerts) {
            return this.projectAlerts[crumbsStr] as ServerbeatAlert;
        }
        return ServerbeatAlert.createGrayAlert();
    }
}
