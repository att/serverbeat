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


import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ServerbeatTagService } from '../db/sqlite3/serverbeat-tag/serverbeat-tag.service';
import { ProjectConfigService } from '../project-config/project-config.service';
import { ServerbeatUtil } from '@serverbeat/shared-lib';
import { TimeSeriesSignal } from '@serverbeat/shared-lib';
import { AuthGuard } from '../app/modules/auth-guard/auth.guard';

@Controller('project/:projectId')
export class ServerbeatTagController {
    constructor(
        private readonly tagService: ServerbeatTagService,
        private readonly projectService: ProjectConfigService
    ) {}

    @Get('tags-and-senders')
    @UseGuards(AuthGuard)
    async getTagsAndSenders(
        @Param() params,
        @Query() queryParams
    ): Promise<any[]> {
        const projectId = params.projectId;
        return this.tagService.getTagsAndSenders(projectId);
    }

    @Get(
        '/tag/:serverbeatTag/subtag/:serverbeatSubtag/time-series-signal-timestamps'
    )
    @UseGuards(AuthGuard)
    async getTimeSeriesTimestamps(
        @Param() params,
        @Query() queryParams
    ): Promise<number[]> {
        const projectId = params.projectId;
        const tag = params.serverbeatTag;
        const subtag = params.serverbeatSubtag;
        let senders = [];
        if ('sender' in queryParams) {
            senders = queryParams.sender.split(',');
        }
        return this.tagService.getTimeSeriesTimestamps(
            projectId,
            tag,
            subtag,
            senders
        );
    }

    @Get(
        '/tag/:serverbeatTag/subtag/:serverbeatSubtag/single-signal-timestamps'
    )
    @UseGuards(AuthGuard)
    async getSingleSignalTimestamps(
        @Param() params,
        @Query() queryParams
    ): Promise<number[]> {
        const projectId = params.projectId;
        const tag = params.serverbeatTag;
        const subtag = params.serverbeatSubtag;
        let senders = [];
        if ('sender' in queryParams) {
            senders = queryParams.sender.split(',');
        }
        return this.tagService.getSingleSignalTimestamps(
            projectId,
            tag,
            subtag,
            senders
        );
    }

    @Get(
        '/tag/:serverbeatTag/subtag/:serverbeatSubtag/time-series-signal/:timestamp'
    )
    @UseGuards(AuthGuard)
    async getTimeSeries(
        @Param() params,
        @Query() queryParams
    ): Promise<TimeSeriesSignal | Error> {
        const projectId = params.projectId;
        const tag = params.serverbeatTag;
        const subtag = params.serverbeatSubtag;
        let timestamp = params.timestamp;

        let senders = [];
        if ('sender' in queryParams) {
            senders = queryParams.sender.split(',');
        }

        if (timestamp === 'latest') {
            // TODO:
            // timestamp = getLatestTimestamp();
            throw new Error('not supported!');
        } else {
            timestamp = +timestamp;
        }

        return this.tagService.getTimeSeriesSignal(
            projectId,
            tag,
            subtag,
            timestamp,
            senders
        );
    }

    @Get(
        '/tag/:serverbeatTag/subtag/:serverbeatSubtag/single-signal/:timestamp'
    )
    @UseGuards(AuthGuard)
    async getSingleAsTimeSeries(
        @Param() params,
        @Query() queryParams
    ): Promise<TimeSeriesSignal> {
        const projectId = params.projectId;
        const tag = params.serverbeatTag;
        const subtag = params.serverbeatSubtag;
        let timestamp = params.timestamp;

        let senders = [];
        if ('sender' in queryParams) {
            senders = queryParams.sender.split(',');
        }

        if (timestamp === 'latest') {
            // TODO:
            // timestamp = getLatestTimestamp();
            throw new Error('not supported!');
        } else {
            timestamp = +timestamp;
        }

        return this.tagService.getSingleSignalsAsTimeSeries(
            projectId,
            tag,
            subtag,
            timestamp,
            senders
        );
    }

    @Post('/time-series-signal')
    async writeTimeSeries(
        @Param() params,
        @Body() signal: any
    ): Promise<string> {
        // TODO: fix return values
        const projectId = params.projectId;
        const timeSeriesSignal = TimeSeriesSignal.fromJson(signal, true);
        return this.tagService.writeTimeSeriesSignal(
            projectId,
            timeSeriesSignal
        );
    }

    @Post('single-signal')
    async writeSingleSignal(
        @Param() params,
        @Body() timeSeriesSignal: TimeSeriesSignal
    ): Promise<string> {
        // TODO: fix return values
        const projectId = params.projectId;
        return this.tagService.writeSingleSignal(projectId, timeSeriesSignal);
    }

    @Get('project-tree')
    @UseGuards(AuthGuard)
    getProjectTree(@Param() params): any {
        const projectId = params.projectId;
        return this.projectService.loadProjectTree(projectId);
    }

    @Get('tag-configs')
    @UseGuards(AuthGuard)
    getTagConfigs(@Param() params): any {
        const projectId = params.projectId;
        return this.projectService.getTagConfigs(projectId);
    }

    @Get('project-config')
    @UseGuards(AuthGuard)
    getProjectConfig(@Param() params): any {
        const projectId = params.projectId;
        return this.projectService.getProjectConfig(projectId);
    }

    @Get('calculate-alerts')
    @UseGuards(AuthGuard)
    async getAlert(@Param() params): Promise<any> {
        const projectId = params.projectId;
        // return this.projectService.readAlert(projectId, 'snapshot_alert_sample');
        return this.projectService.calculateAllAlerts(
            projectId,
            this.tagService
        );
    }

    @Get('tree-leaves-alerts')
    @UseGuards(AuthGuard)
    async getLeafAlerts(@Param() params): Promise<any> {
        const projectId = params.projectId;
        return this.tagService.getTreeLeavesAlerts(projectId);
    }

    @Get('tree-tags-alerts')
    @UseGuards(AuthGuard)
    async getTreeTagsAlerts(@Param() params): Promise<any> {
        const projectId = params.projectId;
        return this.tagService.getTreeTagsAlerts(projectId);
    }

    @Get('/tag/:serverbeatTag/sender/:sender/detailed-tag-alerts')
    @UseGuards(AuthGuard)
    async getDetailedTagAlerts(@Param() params, @Query() query): Promise<any> {
        const projectId = params.projectId;
        const tag = params.serverbeatTag;
        const sender = params.sender;
        const crumbsStr = query.crumbsStr;
        const crumbs = ServerbeatUtil.deserCrumbs(crumbsStr);
        return this.tagService.getDetailedTagAlerts(
            projectId,
            tag,
            sender,
            crumbs
        );
    }

    @Get('/drop-table')
    @UseGuards(AuthGuard)
    async dropTable(@Param() params, @Query() query): Promise<any> {
        const tableName = params.tableName;
        return this.tagService.dropTable(tableName);
    }

    @Get('/delete-time-series-data/retention-days/:days')
    @UseGuards(AuthGuard)
    async deleteOldTimeSeriesSignals(
        @Param() params,
        @Query() queryParams
    ): Promise<any> {
        const projectId = params.projectId;
        const days = params.days;

        return this.tagService.removeOldTimeSeries(projectId, days);
    }

    @Get('/delete-single-signal-data/retention-count/:count')
    async deleteSingleSignalData(@Param() params, @Query() queryParams): Promise<any> {
        const projectId = params.projectId;
        const count = params.count;

        return this.tagService.deleteSingleSignalData(count);
    }
}
