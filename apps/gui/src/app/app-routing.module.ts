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


import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { TagGraphComponent } from './tag-graph/tag-graph.component';
import { MultiTagGraphComponent } from './multi-tag-graph/multi-tag-graph.component';
import { ProjectTreeComponent } from './project-tree/project-tree.component';
import { EmptyLandingComponent } from './empty-landing/empty-landing.component';
import { ProjectTreeGuard } from './guards/project-tree.guard';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
    {
        path: '',
        component: EmptyLandingComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'project/:projectId/tag/:tag',
        component: TagGraphComponent,
        canActivate: [AuthGuard, ProjectTreeGuard]
    },
    {
        path: 'project/:projectId',
        component: ProjectTreeComponent,
        canActivate: [AuthGuard, ProjectTreeGuard]
    },
    {
        path: 'project/:projectId/tags-and-senders',
        component: MultiTagGraphComponent,
        canActivate: [AuthGuard, ProjectTreeGuard]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
