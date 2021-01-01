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


import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval, Timeout, NestSchedule } from 'nest-schedule';
import { ServerbeatTagService } from '../db/sqlite3/serverbeat-tag/serverbeat-tag.service';
import { ProjectConfigService } from '../project-config/project-config.service';

// TODO: make this one distributed using a db lock in case backend is load-balanced in the future
@Injectable()
export class AlertSchedulerService extends NestSchedule {
    constructor(
        private readonly tagService: ServerbeatTagService,
        private readonly projectService: ProjectConfigService
    ) {
        super();
    }

    private readonly logger: Logger = new Logger(AlertSchedulerService.name);

    @Cron('*/5 * * * *', {
        startTime: new Date(new Date().getTime() + 10 * 1000)
    })
    async cronJob() {
        process.stdout.write('starting cronjob for alerts...');
        this.tagService.getAllProjectIds().then(projectIds => {
            for (const projectId of projectIds) {
                this.projectService.calculateAllAlerts(
                    projectId,
                    this.tagService
                );
            }
        });
    }

    @Cron('* */24 * * *', {
        startTime: new Date(new Date().getTime() + 10 * 1000)
    })
    async deleteOlderTimeseries(projectId: string, days: number) {
        process.stdout.write('starting cronjob for deleting older timeseries ...');
        const obsoleteNumOfDays = 10;
        this.tagService.getAllProjectIds().then(projectIds => {
            for (const projectId of projectIds) {
                this.tagService.removeOldTimeSeries(projectId, obsoleteNumOfDays).then( resp => {
                    this.logger.log(resp);
                });
            }
        });
    }


    @Cron('* */24 * * *', {
        startTime: new Date(new Date().getTime() + 10 * 1000)
    })
    async deleteOldSnapshot(projectId: string, days: number) {
        process.stdout.write('starting cronjob for deleting older timeseries ...');
        const obsoleteNumOfDays = 10;
        this.tagService.getAllProjectIds().then(projectIds => {
            for (const projectId of projectIds) {
                this.tagService.removOldSnapshot(projectId, obsoleteNumOfDays).then( resp => {
                    this.logger.log(resp);
                });
            }
        });
    }
}
