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
import { InternalServerErrorException } from '@nestjs/common';
import * as sqlite from 'sqlite3';
import { Connection } from 'typeorm';
import { resolve } from 'url';

import {
    DataPoint,
    TimeSeriesSignal
} from '@serverbeat/shared-lib';
import {
    TrafficLight,
    ServerbeatAlert
} from '@serverbeat/shared-lib';
import { ServerbeatUtil } from '@serverbeat/shared-lib';

// TODO: this class needds need full review:
//  SQL injection risks everywhere,
//  also return values are not theh best
//  also error handling is not good
@Injectable()
export class ServerbeatTagService {
    constructor(private readonly connection: Connection) {}

    public static DB = new sqlite.Database('serverbeat.db');
    private readonly logger: Logger = new Logger(ServerbeatTagService.name);

    public static createTables() {
        ServerbeatTagService.DB.run(`
                CREATE TABLE IF NOT EXISTS time_series_signal(
                    project_id STRING,
                    sender STRING,
                    serverbeat_tag STRING,
                    serverbeat_subtag STRING,
                    signal_data TEXT,
                    signal_timestamp NUMBER,
                    PRIMARY KEY (project_id, sender, serverbeat_tag, serverbeat_subtag, signal_timestamp)
                    )
                `);

        ServerbeatTagService.DB.run(`
                CREATE TABLE IF NOT EXISTS single_signal(
                    project_id STRING,
                    sender STRING,
                    serverbeat_tag STRING,
                    serverbeat_subtag STRING,
                    signal_timestamp NUMBER,
                    actual_status STRING,
                    actual_message STRING,
                    actual_timestamp NUMBER,
                    numeric_value NUMBER,
                    PRIMARY KEY (project_id, sender, serverbeat_tag, serverbeat_subtag, signal_timestamp, actual_timestamp)
                    )
                `);

        ServerbeatTagService.DB.run(`
                CREATE TABLE IF NOT EXISTS alert (
                    project_id STRING,
                    crumbs STRING,
                    sender STRING,
                    serverbeat_tag STRING,
                    serverbeat_subtag STRING,
                    alert_name STRING,
                    alert_status_code NUMBER,
                    alert_message STRING,
                    alert_timestamp NUMBER,
                    PRIMARY KEY (project_id, crumbs, sender, serverbeat_tag, serverbeat_subtag, alert_name)
                    )
                `);
    }

    public async dropTable(tableName: string): Promise<string> {
        try {
            const query = `drop table ${tableName} `;
            const result = await this.connection.query(query, []);
            return `Table ${tableName} dropped`;
        } catch (err) {
            this.logger.error(err.message);
            throw new InternalServerErrorException(err);
        }
    }

    public getTagConfig(projectId: string, tag: string): any {
        return null;
    }

    private toSendersAndString(senders: string[]): string {
        let andSenders = '';
        if (senders.length) {
            const quotedSenders = [];
            senders.forEach(el => {
                // el = '\'' + el + '\'';
                quotedSenders.push('?');
            });
            andSenders = ' and sender in (' + quotedSenders.join(',') + ')';
        }
        return andSenders;
    }

    public async getTagsAndSenders(projectId: string): Promise<any[]> {
        try {
            const queryString = `
                SELECT
                    DISTINCT sender, serverbeat_tag
                FROM
                    single_signal
                WHERE
                    project_id = ?
                UNION
                SELECT
                    DISTINCT sender, serverbeat_tag
                FROM
                    time_series_signal
                WHERE
                    project_id = ?
                `;

            const parameters: any[] = [];
            parameters.push(projectId);
            parameters.push(projectId);
            const result = await this.connection.query(queryString, parameters);
            if (result.length === 0) {
                return [];
            }
            const objs = [];

            for (const row of result) {
                objs.push({
                    sender: row.sender,
                    tag: row.serverbeat_tag
                });
            }

            return objs;
        } catch (err) {
            this.logger.error(err.message);
            throw new InternalServerErrorException(err);
        }
    }

    public getTimeSeriesTimestamps(
        projectId: string,
        tag: string,
        subtag: string,
        senders: string[]
    ): Promise<number[]> {
        return this.getTimestamps(
            'time_series_signal',
            projectId,
            tag,
            subtag,
            senders
        );
    }

    public getSingleSignalTimestamps(
        projectId: string,
        tag: string,
        subtag: string,
        senders: string[]
    ): Promise<number[]> {
        return this.getTimestamps(
            'single_signal',
            projectId,
            tag,
            subtag,
            senders
        );
    }

    private async getTimestamps(
        tableName: string,
        projectId: string,
        tag: string,
        subtag: string,
        senders: string[]
    ): Promise<number[]> {
        try {
            const andSenders = this.toSendersAndString(senders);
            const queryString = `
                SELECT
                    signal_timestamp
                FROM
                    ${tableName}
                WHERE
                    project_id = ? and
                    serverbeat_tag = ? and
                    serverbeat_subtag = ?
                    ${andSenders}
                ORDER BY
                    signal_timestamp
                ASC
                `;
            process.stdout.write(queryString);

            const parameters: any[] = [];
            parameters.push(projectId);
            parameters.push(tag);
            parameters.push(subtag);

            if (senders.length) {
                senders.forEach(el => {
                    // el = '\'' + el + '\'';
                    parameters.push(el);
                });
            }

            const rows = await this.connection.query(queryString, parameters);
            if (!rows || rows.length === 0) {
                return [];
            }

            const allTimestamps = [];
            for (const row of rows) {
                allTimestamps.push(row.signal_timestamp);
            }
            return allTimestamps;
        } catch (err) {
            this.logger.error(err.message);
            throw new InternalServerErrorException(err);
        }
    }

    public async getSingleSignalsAsTimeSeries(
        projectId: string,
        tag: string,
        subtag: string,
        maxSignalTimestamp: number,
        senders: string[]
    ): Promise<TimeSeriesSignal> {
        try {
            if (senders.length !== 1) {
                throw new Error('only one sender is supported at this point!');
            }
            const andSenders = this.toSendersAndString(senders);
            const queryString = `
                SELECT
                    project_id,
                    sender,
                    serverbeat_tag,
                    serverbeat_subtag,
                    signal_timestamp,
                    actual_status,
                    actual_message,
                    actual_timestamp,
                    numeric_value
                FROM (
                        SELECT *,
                            row_number() OVER (PARTITION BY actual_timestamp ORDER BY signal_timestamp DESC) as signal_row_number
                        FROM
                            single_signal
                        WHERE
                            project_id = ? and
                            serverbeat_tag = ? and
                            serverbeat_subtag = ? and
                            signal_timestamp <= ?
                            ${andSenders}
                        ORDER BY
                            actual_timestamp
                        ASC )
                WHERE signal_row_number=1
                `;
            const parameters: any[] = [];
            parameters.push(projectId);
            parameters.push(tag);
            parameters.push(subtag);
            parameters.push(maxSignalTimestamp);

            if (senders.length) {
                senders.forEach(el => {
                    // el = '\'' + el + '\'';
                    parameters.push(el);
                });
            }
            const rows = await this.connection.query(queryString, parameters);
            if (rows.length === 0) {
                const signal = new TimeSeriesSignal(
                    senders[0],
                    [],
                    maxSignalTimestamp,
                    tag,
                    subtag
                );
                return signal;
            }

            const allDataPoints = [];
            for (const row of rows) {
                const dataPoint = DataPoint.fromJson({
                    status: row.actual_status,
                    message: row.actual_message,
                    timestamp: row.actual_timestamp,
                    numericValue: row.numeric_value
                });
                allDataPoints.push(dataPoint);
            }

            const data = new TimeSeriesSignal(
                senders[0],
                allDataPoints,
                rows[0].signal_timestamp,
                rows[0].serverbeat_tag,
                rows[0].serverbeat_subtag
            );

            return data;
        } catch (err) {
            this.logger.error(err.message);
            if (senders.length !== 1) {
                throw new InternalServerErrorException(
                    {
                        status: 500,
                        error: 'only one sender is supported at this point!'
                    },
                    ''
                );
            }
            throw new InternalServerErrorException(err);
        }
    }

    public async getAllProjectIds(): Promise<string[]> {
        try {
            const queryStr = `
            select distinct project_id from (
                SELECT
                    DISTINCT project_id as project_id
                FROM
                    single_signal
                UNION
                SELECT
                    DISTINCT project_id as project_id
                FROM
                    time_series_signal
            )
            `;
            const rows = await this.connection.query(queryStr, []);
            if (!rows || !rows.length) {
                return [];
            } else {
                const projectIds = [];
                for (const row of rows) {
                    projectIds.push(row.project_id);
                }
                return projectIds;
            }
        } catch (err) {
            this.logger.error(err.message);
            throw new InternalServerErrorException(err);
        }
    }

    public async getTimeSeriesSignal(
        projectId: string,
        tag: string,
        subtag: string,
        signalTimestamp: number,
        senders: string[]
    ): Promise<TimeSeriesSignal> {
        try {
            if (senders.length !== 1) {
                throw new Error('only one sender is supported at this point!');
            }
            const andSenders = this.toSendersAndString(senders);

            let andTimestamp = ` and signal_timestamp = ? `;
            if (signalTimestamp === null) {
                andTimestamp = ` and signal_timestamp in (
                SELECT
                    max(signal_timestamp)
                FROM
                    time_series_signal
                WHERE
                    project_id = ? and
                    serverbeat_tag = ? and
                    serverbeat_subtag = ?
                    ${andSenders}
                    )
                    `;
            }
            const queryString = `
                SELECT
                    signal_data
                FROM
                    time_series_signal
                WHERE
                    project_id = ? and
                    serverbeat_tag = ? and
                    serverbeat_subtag = ?
                    ${andTimestamp}
                    ${andSenders}
                `;
            process.stdout.write(queryString);
            const parameters: any[] = [];
            parameters.push(projectId);
            parameters.push(tag);
            parameters.push(subtag);
            if (signalTimestamp == null) {
                parameters.push(projectId);
                parameters.push(tag);
                parameters.push(subtag);
                if (senders.length) {
                    senders.forEach(el => {
                        // el = '\'' + el + '\'';
                        parameters.push(el);
                    });
                }
            } else {
                parameters.push(signalTimestamp);
            }

            if (senders.length) {
                senders.forEach(el => {
                    // el = '\'' + el + '\'';
                    parameters.push(el);
                });
            }
            const rows = await this.connection.query(queryString, parameters);
            if (!rows || !rows.length) {
                return null;
            } else {
                if (!rows || rows.length !== 1) {
                    const msg = `
                        too many or too few results for:
                        project[${projectId}],
                        tag[${tag}],
                        timestamp[${signalTimestamp}]
                        sender[${senders[0]}]
                        `;
                    this.logger.error(msg);
                    return null;
                } else {
                    const data = TimeSeriesSignal.fromJson(
                        JSON.parse(rows[0].signal_data)
                    );
                    return data;
                }
            }
        } catch (err) {
            this.logger.error(err.message);
            if (senders.length !== 1) {
                throw new InternalServerErrorException(
                    {
                        status: 500,
                        error: 'only one sender is supported at this point!'
                    },
                    ''
                );
            }
            throw new InternalServerErrorException(err);
        }
    }

    public async writeAlert(
        projectId: string,
        crumbs: string[],
        sender: string,
        tag: string,
        subtag: string,
        alertName: string,
        alertStatus: TrafficLight,
        alertMessage: string
    ): Promise<string> {
        try {
            const alertTimestamp = ServerbeatUtil.nowInSeconds();

            // let alertCode;
            // if (alertStatus === TrafficLight.GREEN) {
            //     alertCode = 0;
            // } else if (alertStatus === TrafficLight.YELLOW) {
            //     alertCode = 1;
            // } else if (alertStatus === TrafficLight.RED) {
            //     alertCode = 2;
            // }

            const crumbsStr = ServerbeatUtil.serCrumbs(crumbs);

            const sqlStr = `
                INSERT INTO
                    alert
                (
                    project_id,
                    crumbs,
                    sender,
                    serverbeat_tag,
                    serverbeat_subtag,
                    alert_name,
                    alert_status_code,
                    alert_message,
                    alert_timestamp
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?
                )
                ON CONFLICT(
                    project_id,
                    crumbs,
                    sender,
                    serverbeat_tag,
                    serverbeat_subtag,
                    alert_name
                )
                DO UPDATE
                SET
                    alert_status_code = ?,
                    alert_message = ?,
                    alert_timestamp = ?
                `;
            const parameters: any[] = [];
            parameters.push(projectId);
            parameters.push(crumbsStr);
            parameters.push(sender);
            parameters.push(tag);
            parameters.push(subtag);
            parameters.push(alertName);
            parameters.push(alertStatus);
            parameters.push(alertMessage);
            parameters.push(alertTimestamp);
            parameters.push(alertStatus);
            parameters.push(alertMessage);
            parameters.push(alertTimestamp);
            const rows = await this.connection.query(sqlStr, parameters);
            return 'successful: ' + sqlStr;
        } catch (err) {
            this.logger.error(err.message);
            throw new InternalServerErrorException(err);
        }
    }

    public async writeSingleSignal(
        projectId: string,
        data: TimeSeriesSignal
    ): Promise<string> {
        try {
            const sqlStr = `
                    INSERT INTO
                        single_signal
                    (
                        project_id,
                        sender,
                        serverbeat_tag,
                        serverbeat_subtag,
                        signal_timestamp,
                        actual_status,
                        actual_message,
                        actual_timestamp,
                        numeric_value
                    )
                    VALUES
                    (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?
                    )
                    ON CONFLICT(
                        project_id,
                        sender,
                        serverbeat_tag,
                        serverbeat_subtag,
                        signal_timestamp,
                        actual_timestamp
                    )
                    DO UPDATE
                    SET
                        actual_status = ?,
                        actual_message = ?,
                        actual_timestamp = ?,
                        numeric_value  = ?
                    `;
            process.stdout.write(sqlStr);

            const parameters: any[] = [];
            parameters.push(projectId);
            parameters.push(data.sender);
            parameters.push(data.serverbeatTag);
            parameters.push(data.serverbeatSubtag);
            parameters.push(data.signalTimestamp);
            parameters.push(data.dataPoints[0].status);
            parameters.push(data.dataPoints[0].message);
            parameters.push(data.dataPoints[0].timestamp);
            parameters.push(data.dataPoints[0].numericValue || null);
            parameters.push(data.dataPoints[0].status);
            parameters.push(data.dataPoints[0].message);
            parameters.push(data.dataPoints[0].timestamp);
            parameters.push(data.dataPoints[0].numericValue || null);
            const result = await this.connection.query(sqlStr, parameters);
            if (data.dataPoints.length !== 1) {
                const msg = `
                    expected one data point but got[${data.dataPoints.length}]
                    project[${projectId}],
                    tag[${data.serverbeatTag}],
                    tag[${data.serverbeatSubtag}],
                    timestamp[${data.signalTimestamp}]
                    `;
                this.logger.error(msg);
                return null;
            }
            return 'successful: ' + sqlStr;
        } catch (err) {
            this.logger.error(err.message);
            throw new InternalServerErrorException(err);
        }
    }

    public async writeTimeSeriesSignal(
        projectId: string,
        data: TimeSeriesSignal
    ): Promise<string> {
        try {
            process.stdout.write('writing data');
            const sqlStr = `
                INSERT INTO
                    time_series_signal
                (
                    project_id,
                    sender,
                    serverbeat_tag,
                    serverbeat_subtag,
                    signal_data,
                    signal_timestamp
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?
                )
                ON CONFLICT(
                    project_id, sender, serverbeat_tag, serverbeat_subtag, signal_timestamp
                ) DO UPDATE SET signal_data= ?
                `;
            process.stdout.write('writing data1');
            const parameters: any[] = [];
            parameters.push(projectId);
            parameters.push(data.sender);
            parameters.push(data.serverbeatTag);
            parameters.push(data.serverbeatSubtag);
            parameters.push(JSON.stringify(data));
            parameters.push(data.signalTimestamp);
            parameters.push(JSON.stringify(data));
            const result = await this.connection.query(sqlStr, parameters);

            return 'successful: ' + sqlStr;
        } catch (err) {
            this.logger.error(err.message);
            throw new InternalServerErrorException(err);
        }
    }

    public async getTreeLeavesAlerts(projectId: string): Promise<any> {
        try {
            const queryString = `
                SELECT
                    max(alert_status_code) as status,
                    crumbs,
                    min(alert_timestamp) as alert_timestamp
                FROM
                    alert
                WHERE
                    project_id = ?
                GROUP BY
                    crumbs
                `;

            const parameters: any[] = [];
            parameters.push(projectId);
            const rows = await this.connection.query(queryString, parameters);

            if (rows.length === 0) {
                return [];
            }

            const crumbsStrToStatus = {};

            for (const row of rows) {
                crumbsStrToStatus[row.crumbs] = new ServerbeatAlert(
                    row.status,
                    '',
                    row.alert_timestamp
                );
            }
            return crumbsStrToStatus;
        } catch (err) {
            this.logger.error(err.message);
            throw new InternalServerErrorException(err);
        }
    }

    public async getTreeTagsAlerts(projectId: string): Promise<any> {
        try {
            const queryString = `
                SELECT
                    max(alert_status_code) as status,
                    crumbs,
                    serverbeat_tag,
                    min(alert_timestamp) as alert_timestamp
                FROM
                    alert
                WHERE
                    project_id = ?
                GROUP BY
                    crumbs,
                    serverbeat_tag
                `;
            const parameters: any[] = [];
            parameters.push(projectId);
            const rows = await this.connection.query(queryString, parameters);
            if (rows.length === 0) {
                return [];
            }

            const crumbsStrToTagsToStatus = {};

            for (const row of rows) {
                if (!(row.crumbs in crumbsStrToTagsToStatus)) {
                    crumbsStrToTagsToStatus[row.crumbs] = {};
                }
                crumbsStrToTagsToStatus[row.crumbs][
                    row.serverbeat_tag
                ] = new ServerbeatAlert(row.status, '', row.alert_timestamp);
            }
            return crumbsStrToTagsToStatus;
        } catch (err) {
            this.logger.error(err.message);
            throw new InternalServerErrorException(err);
        }
    }

    public async getDetailedTagAlerts(
        projectId: string,
        tag: string,
        sender: string,
        crumbs: string[]
    ): Promise<any> {
        try {
            const crumbsStr = ServerbeatUtil.serCrumbs(crumbs);
            const queryString = `
                SELECT
                    serverbeat_subtag,
                    GROUP_CONCAT(alert_name) as alert_name,
                    max(alert_status_code) as alert_status_code,
                    GROUP_CONCAT(alert_message) as alert_message,
                    min(alert_timestamp) as alert_timestamp
                FROM
                    alert
                WHERE
                    project_id = ? and
                    crumbs LIKE ? and
                    serverbeat_tag = ? and
                    sender = ?
                GROUP BY
                    serverbeat_subtag
                `;
            const parameters: any[] = [];
            parameters.push(projectId);
            parameters.push(crumbsStr + '%');
            parameters.push(tag);
            parameters.push(sender);

            process.stdout.write(queryString);
            const rows = await this.connection.query(queryString, parameters);

            if (rows.length === 0) {
                return {};
            }

            const subtagsToAlerts = {};

            for (const row of rows) {
                subtagsToAlerts[row.serverbeat_subtag] = new ServerbeatAlert(
                    row.alert_status_code,
                    row.alert_message,
                    row.alert_timestamp
                );
            }
            return subtagsToAlerts;
        } catch (err) {
            this.logger.error(err.message);
            throw new InternalServerErrorException(err);
        }
    }

    public async removeOldAlerts(
        projectId: string,
        startTimeInSeconds: number
    ): Promise<any> {
        try {
            const queryString = `
                DELETE
                FROM
                    alert
                WHERE
                    project_id = ? AND
                    alert_timestamp < ?
                `;
            const parameters: any[] = [];
            parameters.push(projectId);
            parameters.push(startTimeInSeconds);

            const result = await this.connection.query(queryString, parameters);
            return 'successful: ' + queryString;
        } catch (err) {
            this.logger.error(err.message);
            throw new InternalServerErrorException(err);
        }
    }

    public async removeOldTimeSeries(
        projectId: string,
        days: number
    ): Promise<any> {
        try {
            process.stdout.write(
                `deleting signals older than ${days} days for ${projectId}...`
            );
            const daysBackInSeconds = ServerbeatUtil.daysBackInSeconds(days);
            const queryString = `
                DELETE
                FROM
                time_series_signal
                WHERE
                    project_id = ? AND
                    signal_timestamp < ?
                `;
            const parameters: any[] = [];
            parameters.push(projectId);
            parameters.push(daysBackInSeconds);
            const result = await this.connection.query(queryString, parameters);

            return 'successful: ' + queryString;
        } catch (err) {
            this.logger.error(err.message);
            throw new InternalServerErrorException(err);
        }
    }

    public async removOldSnapshot(
        projectId: string,
        days: number
    ): Promise<any> {
        try {
            process.stdout.write(
                `deleting signals older than ${days} days for ${projectId}...`
            );
            const daysBackInSeconds = ServerbeatUtil.daysBackInSeconds(days);
            const queryString = `
                DELETE
                FROM
                single_signal
                WHERE
                    project_id = ? AND
                    signal_timestamp < ?
                `;
            const parameters: any[] = [];
            parameters.push(projectId);
            parameters.push(daysBackInSeconds);
            const result = await this.connection.query(queryString, parameters);

            return 'successful: ' + queryString;
        } catch (err) {
            this.logger.error(err.message);
            throw new InternalServerErrorException(err);
        }
    }


    public deleteSingleSignalData( count: number ) {

        process.stdout.write(`limiting no of duplicates for single_signal actual_timestamp to atmost ${count} `) ;

        const queryString = `
            DELETE
            FROM
                single_signal
            WHERE signal_timestamp NOT IN (
                SELECT
                    signal_timestamp
                FROM (
                        SELECT * ,
                            row_number() OVER (PARTITION BY project_id,sender,serverbeat_tag,serverbeat_subtag,actual_timestamp ORDER BY signal_timestamp DESC) as signal_row_number
                        FROM
                            single_signal
                        ORDER BY
                            actual_timestamp
                        ASC )
                WHERE signal_row_number <= ${count} )
        `;
        ServerbeatTagService.DB.run(queryString);
    }

}
