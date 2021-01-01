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


import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ServerbeatTagController } from './../serverbeat-tag/serverbeat-tag.controller';
import { ServerbeatTagService } from './../db/sqlite3/serverbeat-tag/serverbeat-tag.service';
import { ProjectConfigService } from './../project-config/project-config.service';
import { ScheduleModule } from 'nest-schedule';
import { AlertSchedulerService } from './../alert-scheduler/alert-scheduler.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomLoggerModule } from './../custom-logger/custom-logger.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
    imports: [
        ScheduleModule.register({}),
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: 'serverbeat.db',
            // entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: ['error'],
            logger: 'advanced-console',
            maxQueryExecutionTime: 1000
        }),
        CustomLoggerModule,
        AuthModule.forRoot(AuthModule.NO_AUTH, [])
    ],
    controllers: [AppController, ServerbeatTagController],
    providers: [
        AppService,
        ServerbeatTagService,
        ProjectConfigService,
        AlertSchedulerService
    ]
})
export class AppModule {}
