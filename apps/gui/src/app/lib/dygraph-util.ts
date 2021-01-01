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


import {
    ArtificialDataPoint,
    DataPoint,
    DataPointType,
    MissingDataPoint,
    NotOkDataPoint,
    OkDataPoint
} from '@serverbeat/shared-lib';
import { MatDialog } from '@angular/material';
import { TagGraphDialogComponent } from '../tag-graph-dialog/tag-graph-dialog.component';

export class DygraphUtil {
    public dygraphData;
    public dygraphOptions;
    public displayHoverDataPoint = null;

    public static getDygraphLabels(): string[] {
        const labels = ['Date', 'data'];
        return labels;
    }

    public static getHeight(hasNumericValue: boolean): number {
        return hasNumericValue ? 200 : 70;
    }

    public static getLabelColors(): string[] {
        const colors = [null, OkDataPoint.COLOR];
        console.log('colors', colors);
        return colors;
    }

    public updateDateRange(lastTimestamp, sla, criticalWindow) {
        const firstTimestamp = lastTimestamp - (sla + criticalWindow) * 60;
        this.dygraphOptions.dateWindow = [
            firstTimestamp * 1000,
            lastTimestamp * 1000
        ];
    }

    public getDateRange(lastTimestamp, sla, criticalWindow): [number, number] {
        const firstTimestamp = lastTimestamp - (sla + criticalWindow) * 60;
        return [firstTimestamp * 1000, lastTimestamp * 1000];
    }

    constructor(
        private serverbeatTag: string,
        private serverbeatSubtag: string,
        private hasNumericValue: boolean,
        private tagDisplayName: string,
        private lastTs: number,
        private sla: number,
        private criticalWindow: number,
        private dataPoints: DataPoint[],
        private dialog: MatDialog
    ) {
        this.dygraphData = this.produceData();
        this.dygraphOptions = this.produceOptions(this.hasNumericValue);
    }

    private produceOptions(hasNumericValue: boolean) {
        const labels = DygraphUtil.getDygraphLabels();
        const colors = DygraphUtil.getLabelColors();
        const labelConfigs = {};
        for (let i = 1; i < labels.length; ++i) {
            if (this.hasNumericValue) {
                labelConfigs[labels[i]] = {
                    strokeWidth: 0.4,
                    drawPoints: true,
                    pointSize: 2,
                    strokeBorderWidth: 0,
                    color: colors[i],
                    highlightCircleSize: 4,
                    drawPointCallback: this.drawPointCallback.bind(this),
                    drawHighlightPointCallback: this.drawPointCallback.bind(
                        this
                    )
                };
            } else {
                labelConfigs[labels[i]] = {
                    strokeWidth: 0.0,
                    drawPoints: true,
                    pointSize: 4,
                    strokeBorderWidth: 1,
                    color: colors[i],
                    highlightCircleSize: 6,
                    drawPointCallback: this.drawPointCallback.bind(this),
                    drawHighlightPointCallback: this.drawPointCallback.bind(
                        this
                    )
                };
            }
        }
        const options = {
            axes: {
                y: {
                    drawAxis: hasNumericValue
                }
            },
            labelsKMB: true,
            labels: DygraphUtil.getDygraphLabels(),
            connectSeparatedPoints: true,
            drawPoints: true,
            legend: 'never',
            xRangePad: 10,
            highlightSeriesBackgroundAlpha: 1,
            series: labelConfigs,
            width: '100%',
            height: DygraphUtil.getHeight(this.hasNumericValue),
            highlightCallback: this.highlightHandler.bind(this),
            pointClickCallback: this.dataPointClickHandler.bind(this),
            unhighlightCallback: this.unhighlightEventHandler.bind(this),
            underlayCallback: this.backgroundHighlighter.bind(this),
            showRangeSelector: true,
            rangeSelectorHeight: 20,
            rangeSelectorPlotStrokeColor: 'white',
            rangeSelectorPlotFillColor: 'white',
            includeZero: this.hasNumericValue
            // keepMouseZoom: true # doesn't work
            // customBars: true,
        };

        return options;
    }

    private drawPointCallback(
        g,
        seriesName,
        ctx,
        canvasx,
        canvasy,
        color,
        radius,
        idx
    ) {
        console.log('drawPointCallbackcalled');
        this.drawCircle(
            g,
            seriesName,
            ctx,
            canvasx,
            canvasy,
            color,
            radius,
            idx
        );
    }

    private drawCircle(
        g,
        seriesName,
        ctx,
        canvasx,
        canvasy,
        color,
        radius,
        idx
    ) {
        color = this.dataPoints[idx].getColor();
        ctx.beginPath();
        ctx.fillStyle = color;

        ctx.arc(canvasx, canvasy, radius, 0, 2 * Math.PI, false);
        ctx.fill();
    }

    private highlightPeriod(startSeconds, endSeconds) {}

    private produceData() {
        const data = [];
        this.dataPoints.forEach((dataPoint, index) => {
            const singleDateAr: any[] = [];
            const labels = DygraphUtil.getDygraphLabels();
            for (const label of labels) {
                singleDateAr.push(
                    this.hasNumericValue ? dataPoint.getNumericValue() : 1
                );
            }
            singleDateAr[0] = new Date(Number(dataPoint.timestamp * 1000));
            data.push(singleDateAr);
        });
        console.log(`dataPoints for ${this.serverbeatTag}`, this.dataPoints);
        console.log(`data for ${this.serverbeatTag}`, data);
        return data;
    }

    private backgroundHighlighter(canvas, area, g) {
        // const criticalDisplayEnd = Math.round((new Date()).getTime() / 1000) - this.sla * 60;
        // const criticalDisplayStart = criticalDisplayEnd - (this.criticalWindow * 60);
        // const criticalDisplayLeft = g.toDomXCoord(criticalDisplayStart * 1000);
        // const criticalDisplayRight = g.toDomXCoord(criticalDisplayEnd * 1000);
        // const criticalDisplayWidth = criticalDisplayRight - criticalDisplayLeft;
        //
        // const veryFirstSecond = this.dataPoints[0].timestamp;
        // const oldDataDisplayLeft = g.toDomXCoord(veryFirstSecond * 1000);
        // const oldDataDisplayWidth = criticalDisplayLeft - oldDataDisplayLeft;
        //
        // canvas.fillStyle = '#f2fdf4';
        // canvas.fillRect(criticalDisplayLeft, area.y, criticalDisplayWidth, area.h);
        //
        // canvas.fillStyle = '#f2f4fd';
        // canvas.fillRect(oldDataDisplayLeft, area.y, oldDataDisplayWidth, area.h);

        const unimportantEnd = Math.max(
            this.dataPoints[this.dataPoints.length - 1].timestamp,
            Math.round(new Date().getTime() / 1000)
        );
        const unimportantStart = this.lastTs - this.sla * 60;

        const unimportantLeft = g.toDomXCoord(unimportantStart * 1000);
        const unimportantRight = g.toDomXCoord(unimportantEnd * 1000);
        const unimportantWidth = unimportantRight - unimportantLeft;

        // const pat = canvas.createPattern('src/assets/empty-pattern.png', 'repeat')
        // canvas.fillStyle = pat;
        canvas.fillStyle = '#dadada';
        canvas.fillRect(unimportantLeft, area.y, unimportantWidth, area.h);
    }

    private highlightHandler(evt, x, params, index, status) {
        this.displayHoverDataPoint = this.dataPoints[index];
        console.log('highlight handler!');
    }

    private dataPointClickHandler(evt, params) {
        console.log('click handler');
        console.log('click', evt, params);
        const clickDataPoint = this.dataPoints[params.idx];
        const dialogRef = this.dialog.open(TagGraphDialogComponent, {
            width: '500px',
            data: {
                dataPoint: clickDataPoint,
                serverbeatTag: this.serverbeatTag,
                serverbeatSubtag: this.serverbeatSubtag,
                tagDisplayName: this.tagDisplayName
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
        });
    }

    private unhighlightEventHandler(evt) {
        this.displayHoverDataPoint = null;
    }
}
