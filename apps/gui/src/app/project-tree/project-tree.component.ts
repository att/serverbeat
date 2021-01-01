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


import { Component, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material';
import { FlatTreeControl } from '@angular/cdk/tree';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectTreeNode } from '@serverbeat/shared-lib';
import { ProjectTreeService } from '../project-tree.service';
import { ServerbeatAlert } from '@serverbeat/shared-lib';

interface ProjectTreeFlatNode {
    expandable: boolean;
    name: string;
    level: number;
}

@Component({
    selector: 'app-project-tree',
    templateUrl: './project-tree.component.html',
    styleUrls: ['./project-tree.component.css']
})
export class ProjectTreeComponent implements OnInit {
    treeControl = new FlatTreeControl<ProjectTreeFlatNode>(
        node => node.level,
        node => node.expandable
    );

    treeFlattener = new MatTreeFlattener(
        this.transformer,
        node => node.level,
        node => node.expandable,
        node => node.children
    );

    dataSource = new MatTreeFlatDataSource(
        this.treeControl,
        this.treeFlattener
    );

    private transformer(node: ProjectTreeNode, levell: number): any {
        return {
            expandable: !!node.children && node.children.length > 0,
            name: node.name,
            level: levell,
            tagsAndSenders: node.tagsAndSenders,
            crumbs: node.crumbs
        };
    }

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private projectTreeService: ProjectTreeService
    ) {}

    hasChild = (_: number, node: ProjectTreeFlatNode) => node.expandable;

    ngOnInit(): void {
        const projectId = this.route.snapshot.params.projectId;
        this.dataSource.data = this.projectTreeService.treeData;
        this.treeControl.expandAll();
    }

    goToCrumb(crumbs: string[]) {
        const newCrumbs = crumbs.join(',');
        this.router.navigate(['tags-and-senders'], {
            relativeTo: this.route,
            queryParams: { crumbs: newCrumbs }
        });
    }

    getServerbeatAlert(crumbs: string[]): ServerbeatAlert {
        return this.projectTreeService.getServerbeatAlert(crumbs);
    }
}
