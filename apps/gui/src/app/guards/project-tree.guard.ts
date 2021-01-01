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
    ActivatedRouteSnapshot,
    CanActivate,
    RouterStateSnapshot,
    UrlTree
} from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { ProjectTreeService } from '../project-tree.service';
import { TagGraphService } from '../services/tag-graph.service';

@Injectable({
    providedIn: 'root'
})
export class ProjectTreeGuard implements CanActivate {
    constructor(
        private projectService: ProjectTreeService,
        private tagService: TagGraphService
    ) {}
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ):
        | Observable<boolean | UrlTree>
        | Promise<boolean | UrlTree>
        | boolean
        | UrlTree {
        console.log('guard1');
        if (
            !this.projectService.treeData ||
            !this.tagService.tagConfigs ||
            !this.projectService.projectConfig
        ) {
            console.log('guard2');
            const calls = [
                this.projectService.getProjectTree(route.params.projectId),
                this.tagService.initiateTags(route.params.projectId)
            ];
            return forkJoin(calls)
                .toPromise()
                .then(r => {
                    return true;
                });
        }
        console.log('guard4');
        return true;
    }
}
