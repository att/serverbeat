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


import { Injectable } from '@nestjs/common';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as util from 'util';

import { ServerbeatTagService } from '../db/sqlite3/serverbeat-tag/serverbeat-tag.service';
import { TimeSeriesSignal } from '@serverbeat/shared-lib';
import {
    ProjectTreeNode,
    ProjectTreeParseAction
} from '@serverbeat/shared-lib';
import { ServerbeatUtil } from '@serverbeat/shared-lib';
import {
    ServerbeatTagConfig,
    ServerbeatSubtagConfig,
    ServerbeatProjectConfig,
    SubtagType,
    ServerbeatAlertConfig
} from '@serverbeat/shared-lib';


@Injectable()
export class ProjectConfigService {
    private static PROJECTS_DIR = process.env.SERVERBEAT_PROJECTS_DIR || './apps/projects';
    private static TREE_FILE = 'tree.yaml';
    private static PROJECT_CONFIG_FILE = 'projectConfig.yaml';
    private static TAGS_DIR = 'tags';
    private static ALERTS_DIR = 'alerts';

    public readYamlFile(projectId: string, relativePath: string): any {
        const fileLocation =
            ProjectConfigService.PROJECTS_DIR +
            '/' +
            projectId +
            '/' +
            relativePath;
        try {
            const doc = yaml.safeLoad(fs.readFileSync(fileLocation, 'utf8'));
            return doc;
        } catch (e) {
            throw new Error(
                `error reading file[${fileLocation}] message[${e.message}]`
            );
        }
    }

    private getTagConfig(
        projectId: string,
        tag: string,
        forceReload = false
    ): ServerbeatTagConfig {
        const relativePath = ProjectConfigService.TAGS_DIR + '/' + tag;
        const doc = this.readYamlFile(projectId, relativePath);
        if (doc.type !== ServerbeatTagConfig.MULTI_TYPE && doc.subtags) {
            throw new Error(
                `tag[${tag}] configuration error! only 'multi' type can have subtags`
            );
        }
        let subtags = [];
        if (doc.type === ServerbeatTagConfig.MULTI_TYPE) {
            for (const rawSubtag of doc.subtags) {
                subtags.push(
                    new ServerbeatSubtagConfig(
                        rawSubtag.type,
                        rawSubtag.subtag,
                        rawSubtag.display_name,
                        rawSubtag.is_default,
                        rawSubtag.draw_missing
                    )
                );
            }
        } else if (SubtagType[doc.type] !== null) {
            subtags = [ServerbeatSubtagConfig.createDefault(doc.type)];
        } else {
            throw new Error('not supported!');
        }
        console.log(doc);
        const signalConfig = new ServerbeatTagConfig(
            tag,
            doc.display_name,
            doc.description,
            doc.frequency,
            doc.tolerance,
            doc.sla,
            doc.critical_window,
            subtags,
            doc.dependencies
        );
        return signalConfig;
    }

    public getTagConfigs(projectId: string, forceReload = false) {
        const projectTree = this.readYamlFile(
            projectId,
            ProjectConfigService.TREE_FILE
        );
        const tagsToSenders = ProjectTreeNode.traverseTree(
            projectTree,
            ProjectTreeParseAction.TAGS_TO_SENDERS
        );
        const tagConfigs = {};
        console.log('*******');
        console.log(tagsToSenders);
        console.log('*******');

        for (const tag of Object.keys(tagsToSenders)) {
            const signalConfig = this.getTagConfig(projectId, tag);
            tagConfigs[tag] = signalConfig;
        }
        console.log(tagConfigs);
        return tagConfigs;
    }

    public getProjectConfig(
        projectId: string,
        forceReload = false
    ): ServerbeatProjectConfig {
        const doc = this.readYamlFile(
            projectId,
            ProjectConfigService.PROJECT_CONFIG_FILE
        );
        console.log(doc);
        const projectConfig = new ServerbeatProjectConfig(
            doc.available_views,
            doc.default_view
        );
        console.log(projectConfig);
        return projectConfig;
    }

    public loadProjectTree(projectId: string, forceReload = false) {
        // if (this.projectTree && ! forceReload) {
        //     return this.projectTree;
        // }
        const projectTree = this.readYamlFile(
            projectId,
            ProjectConfigService.TREE_FILE
        );
        return projectTree;
        ProjectTreeNode.traverseTree(
            projectTree,
            ProjectTreeParseAction.TO_MATERIAL_TREE
        );
        ProjectTreeNode.traverseTree(
            projectTree,
            ProjectTreeParseAction.TAGS_TO_SENDERS
        );
        ProjectTreeNode.traverseTree(
            projectTree,
            ProjectTreeParseAction.SENDERS_TO_TAGS
        );
    }

    async calculateAllAlerts(
        projectId: string,
        tagService: ServerbeatTagService,
        forceReload = false
    ) {
        const projectTree = this.readYamlFile(
            projectId,
            ProjectConfigService.TREE_FILE
        );
        const tagsAndSenders = ProjectTreeNode.traverseTree(
            projectTree,
            ProjectTreeParseAction.TAGS_AND_SENDERS
        );
        const tagConfigs = this.getTagConfigs(projectId);
        const alertConfigs = {};
        const startTimeInSeconds = ServerbeatUtil.nowInSeconds();
        for (const tagAndSender of tagsAndSenders) {
            if (!('alerts' in tagAndSender)) {
                continue;
            }

            const tagConfig = tagConfigs[
                tagAndSender.tag
                ] as ServerbeatTagConfig;
            for (const alertName in tagAndSender.alerts) {
                const subtags = tagAndSender.alerts[alertName];
                for (const subtag of subtags) {
                    const subtagConfig = tagConfig.getSubtagConfig(subtag);

                    let timeSeriesSignal: TimeSeriesSignal = null;
                    if (subtagConfig.isTimeSeries()) {
                        timeSeriesSignal = await tagService
                            .getTimeSeriesSignal(
                                projectId,
                                tagAndSender.tag,
                                subtag,
                                null,
                                [tagAndSender.sender]
                            )
                    } else {
                        timeSeriesSignal = await tagService.getSingleSignalsAsTimeSeries(
                            projectId,
                            tagAndSender.tag,
                            subtag,
                            null, // TODO: pass current timestamp
                            [tagAndSender.sender]
                        )
                    }
                    try {

                                if (subtagConfig.drawMissing) {
                                    timeSeriesSignal.fillInTheBlank(
                                        tagConfig.signalFrequency,
                                        tagConfig.signalTolerance,
                                        tagConfig.signalSla,
                                        tagConfig.signalCriticalWindow
                                    );
                                }
                                let alertConfig;
                                if (alertName in alertConfigs) {
                                    alertConfig = alertConfigs[alertName];
                                } else {
                                    alertConfig = this.readAlertConfig(
                                        projectId,
                                        alertName
                                    );
                                    alertConfigs[alertName] = alertConfig;
                                }
                                const alert = alertConfig.calculateAlert(
                                    tagConfig.signalSla,
                                    timeSeriesSignal
                                );
                                tagService.writeAlert(
                                    projectId,
                                    tagAndSender.crumbs,
                                    tagAndSender.sender,
                                    tagAndSender.tag,
                                    subtag,
                                    alertName,
                                    alert.traffictLight,
                                    alert.message
                                );
                                console.log("*********");
                                console.log(tagAndSender);
                                console.log("*********");
                                console.log(alert);

                    } catch (e) {
                        console.log(
                            `error in processing alert for tag[${
                                tagAndSender.tag
                            }] subtag[${subtag}] sender[${
                                tagAndSender.sender
                            }] project[${projectId}] alert[${alertName}]`
                        );
                    }

                }
            }
        }
        tagService.removeOldAlerts(projectId, startTimeInSeconds);
        console.log(util.inspect(tagsAndSenders, false, null, true));
        // console.log(tagsAndSenders);
    }

    public readAlertConfig(
        projectId: string,
        alertName: string,
        forceReload = false
    ): ServerbeatAlertConfig {
        const relativePath = ProjectConfigService.ALERTS_DIR + '/' + alertName;
        const doc = this.readYamlFile(projectId, relativePath);
        const alertConfig = ServerbeatAlertConfig.fromYaml(alertName, doc);
        return alertConfig;
    }
}
