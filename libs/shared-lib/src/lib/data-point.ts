// this is just an idea; you may want to change DataPoint to class or pass configs to constructor in TimeSeries, etc.

import { ServerbeatUtil } from './serverbeat-util';

/**
 * @export Enumerator for DataPoint type
 * @enum {number} - Value representing the type of DataPoint
 */
export enum DataPointType {
    Ok = 'OK',
    NotOk = 'NOT_OK',
    Missing = 'MISSING',
    Artificial = 'EXPECTED'
}

/**
 * State representation at specific timestamp
 * @class DataPoint
 */
export abstract class DataPoint {

    /**
     * Retrieves the DataPoint object from the json
     * @param obj The json representation for DataPoint
     * @returns  datapoint object from json
     */
    public static fromJson(obj): DataPoint {
        if (obj.status === DataPointType.Ok) {
            return new OkDataPoint(
                obj.status,
                +obj.timestamp,
                obj.message,
                obj.numericValue || 0
            );
        } else if (obj.status === DataPointType.NotOk) {
            return new NotOkDataPoint(
                obj.status,
                +obj.timestamp,
                obj.message,
                obj.numericValue || 0
            );
        } else if (obj.status === DataPointType.Missing) {
            return new MissingDataPoint(
                obj.status,
                +obj.timestamp,
                obj.message,
                obj.numericValue || 0
            );
        } else if (obj.status === DataPointType.Artificial) {
            return new ArtificialDataPoint(+obj.timestamp, obj.message);
        } else {
            throw new Error('not supported!');
        }
    }

    /**
     * Verifies whether the datapoint type is ok
     * @returns A boolean value representing whether the datapoint type is ok
     */
    public isOk(): boolean {
        return this.status === DataPointType.Ok;
    }

    /**
     * Verifies whether the datapoint type is Not Ok
     * @returns A boolean value representing whether the datapoint type is Not Ok
     */
    public isNotOk(): boolean {
        return this.status === DataPointType.NotOk;
    }

    /**
     * Whether the datapoint type is Missing or not
     * @returns A boolean value representing whether the datapoint type is Missing or not
     */
    public isMissing(): boolean {
        return this.status === DataPointType.Missing;
    }

    /**
     * Whether the datapoint type is Artificial
     * @returns A boolean value representing whether the datapoint type is Artificial
     */
    public isArtificial(): boolean {
        return this.status === DataPointType.Artificial;
    }

    /**
     * Converts the timestamp value into human readable Dateformat
     * @returns The timestamp in readable format
     */
    public toReadableTimestamp(): string {
        return ServerbeatUtil.toReadableDateFormat(this.timestamp, true);
    }

    /**
     * get the Numeric Value for the Datapoint
     * @returns The numericValue
     */
    public getNumericValue(): number {
        return this.numericValue || 0;
    }

    /**
     * Creates an instance of DataPoint.
     * @param {DataPointType} status - represents status of Datapoint
     * @param {number} timestamp - number of seconds since epoch
     * @param {string} message - Specific message representing datapoint
     * @param {number} [numericValue] - Numeric value representation for DataPoint
     */
    constructor(
        public status: DataPointType,
        public timestamp: number,
        public message: string,
        public numericValue?: number
    ) {}

    /**
     * Gets the display name for DataPoint.
     * @returns {string} Human readable string representation for the DataPoint
     */
    public abstract getDisplayName(): string;
    /**
     * Gets color value for the DataPoint
     * @returns Color propery value in string
     */
    public abstract getColor(): string;
}
/**
 * Datapoint Object of Ok DataPoint type.
 * @class OkDataPoint
 * @extends {DataPoint}
 */
export class OkDataPoint extends DataPoint {
    public static COLOR = 'black';

    /**
     * Gets the display name for OkDataPoint
     * @returns Human readable string representation for the OkDataPoint
     */
    getDisplayName(): string {
        return 'OK';
    }

    /**
     * Gets color value for the DataPoint
     * @returns Color propery value in string
     */
    getColor(): string {
        return OkDataPoint.COLOR;
    }
}

/**
 * Datapoint Object of Not Ok DataPoint type.
 * @class NotOkDataPoint
 * @extends {DataPoint}
 */
export class NotOkDataPoint extends DataPoint {
    public static COLOR = 'red';

    /**
     * Gets the display name for NotOkDataPoint
     * @returns Human readable string representation for the OkDataPoint
     */
    getDisplayName(): string {
        return 'Not OK';
    }

    /**
     * Gets color value for the NotOkDataPoint
     * @returns Color propery value in string
     */
    getColor(): string {
        return NotOkDataPoint.COLOR;
    }
}

/**
 * Datapoint Object of missing DataPoint type.
 * @class MissingDataPoint
 * @extends {DataPoint}
 */
export class MissingDataPoint extends DataPoint {
    public static COLOR = 'orange';

    /**
     * Gets the display name for MissingDataPoint
     * @returns Human readable string representation for the OkDataPoint
     */
    getDisplayName(): string {
        return 'Missing';
    }

    /**
     * Gets color value for the NotOkDataPoint
     * @returns Color propery value in string
     */
    getColor(): string {
        return MissingDataPoint.COLOR;
    }
}

/**
 * Datapoint Object representing  artificial DataPoint type.
 * @class ArtificialDataPoint
 * @extends {DataPoint}
 */
export class ArtificialDataPoint extends DataPoint {
    /**
     * Color indicator for ArtificialDataPoint
     */
    public static COLOR = 'orange';

    /**
     * Creates an instance of ArtificialDataPoint.
     * @param timestamp - Number of milliseconds since epoch
     * @param [message=null] - Message description for the DataPoint
     */
    constructor(timestamp: number, message = null) {
        if (message !== null) {
            super(DataPointType.Artificial, timestamp, message);
        } else {
            super(
                DataPointType.Artificial,
                timestamp,
                'Missing signal from the server'
            );
        }
    }

    /**
     * Gets the display name for ArtificialDataPoint
     * @returns {string} Human readable string representation for the ArtificialDataPoint
     */
    getDisplayName(): string {
        return 'No Signal';
    }

    /**
     * Gets color value for the ArtificialDataPoint
     * @returns Color propery value in string
     */
    getColor(): string {
        return ArtificialDataPoint.COLOR;
    }
}

/**
 * Class representation of series of datapoints for a signalTimestamp
 * @class TimeSeriesSignal
 */
export class TimeSeriesSignal {
    // TODO: fix tag later
    /**
     * Create a TimeSeriesSignal from json representation of the time series data
     * @param {*} obj - JSON representation of the time series signal
     * @param {boolean} [sortDataPoints=false] - Boolean represents whether to sort the DataPoints in the series
     * @returns {TimeSeriesSignal} - new TimeSeriesSignal object represented by the json stream of time series data
     */
    public static fromJson(obj: any, sortDataPoints = false): TimeSeriesSignal {
        const dataPoints: DataPoint[] = [];
        // console.log('raw dataPoints are');
        // console.log(obj.dataPoints);
        for (const rawPoint of obj.dataPoints) {
            dataPoints.push(DataPoint.fromJson(rawPoint));
        }
        return new TimeSeriesSignal(
            obj.sender,
            dataPoints,
            obj.signalTimestamp,
            obj.serverbeatTag,
            obj.serverbeatSubtag,
            sortDataPoints
        );
    }

    /**
     * Populate the in-between DataPoints for the TimeSeriesSignal
     * @param {number} frequency - A numeric value representing the expected frequency in minutes
     * @param {number} tolerance - A numeric value representing the tolerance in minutes
     * @param {number} sla - A numeric value representing the sla in minutes
     * @param {number} criticalWindow - A numeric value representing the criticalWindow in minutes
     */
    public fillInTheBlank(
        frequency: number,
        tolerance: number,
        sla: number,
        criticalWindow: number
    ): void {
        const frequencySeconds = frequency * 60;
        const toleranceSeconds = tolerance * 60;
        const slaSeconds = sla * 60;
        const criticalWindowSeconds = criticalWindow * 60;

        const curTs = Math.round(new Date().getTime() / 1000);
        const endTime =
            curTs > this.signalTimestamp ? curTs : +this.signalTimestamp;

        let startTime =
            endTime -
            (slaSeconds +
                criticalWindowSeconds +
                Math.abs(curTs - this.signalTimestamp));
        if (this.dataPoints.length !== 0) {
            if (+this.dataPoints[0].timestamp < startTime) {
                startTime = +this.dataPoints[0].timestamp;
            }
        }

        const newDataPoints: DataPoint[] = [];

        if (this.dataPoints.length === 0) {
            this.dataPoints.push(new ArtificialDataPoint(startTime));
        }

        // before first:
        const beforeTimestamps = this.produceArtificialTimestamps(
            startTime,
            this.dataPoints[0].timestamp,
            frequencySeconds,
            toleranceSeconds
        );
        for (const timestamp of beforeTimestamps) {
            newDataPoints.push(new ArtificialDataPoint(timestamp));
        }

        // in-between points:
        for (let i = 0; i < this.dataPoints.length - 1; ++i) {
            newDataPoints.push(this.dataPoints[i]);
            const betweenTimestamps = this.produceArtificialTimestamps(
                this.dataPoints[i].timestamp,
                this.dataPoints[i + 1].timestamp,
                frequencySeconds,
                toleranceSeconds
            );
            for (const timestamp of betweenTimestamps) {
                newDataPoints.push(new ArtificialDataPoint(timestamp));
            }
        }
        newDataPoints.push(this.dataPoints[this.dataPoints.length - 1]);

        // after last:
        const afterTimestamps = this.produceArtificialTimestamps(
            this.dataPoints[this.dataPoints.length - 1].timestamp,
            endTime,
            frequencySeconds,
            toleranceSeconds
        );
        for (const timestamp of afterTimestamps) {
            newDataPoints.push(new ArtificialDataPoint(timestamp));
        }

        this.dataPoints = newDataPoints;
    }

    /**
     * Generate Artificial timestamps for in between the DataPoints
     * @param {number} start - timestamp value for the start DataPoint
     * @param {number} end - timestamp value for the end DataPoint
     * @param {number} frequencySeconds - numeric value for frequencySeconds
     * @param {number} toleranceSeconds - numeric value for toleranceSeconds
     * @returns {number[]} A list of timestamps representing timestamps for in between DataPoints
     */
    private produceArtificialTimestamps(
        start,
        end,
        frequencySeconds,
        toleranceSeconds
    ): number[] {
        const distance = frequencySeconds + toleranceSeconds;

        const timestamps = [];
        while (start + distance < end) {
            timestamps.push(start + frequencySeconds);
            start += frequencySeconds;
        }
        return timestamps;
    }

    /**
     * Sort the list of DataPoints in descending order for the TimeSeriesSignal.
     * @memberof TimeSeriesSignal
     */
    public sortDataPoints(): void {
        this.dataPoints = this.dataPoints.sort((a, b) => {
            if (a.timestamp < b.timestamp) {
                return -1;
            }
            if (a.timestamp > b.timestamp) {
                return 1;
            }
            return 0;
        });
    }

    /**
     * Creates an instance of TimeSeriesSignal.
     * @param {string} sender
     * @param {DataPoint[]} dataPoints - List of DataPoints
     * @param {number} signalTimestamp - Number of milliseconds since epoch
     * @param {string} serverbeatTag - String representation of serverbeatTag
     * @param {string} serverbeatSubtag - String representation of serverbeatSubtag
     * @param {boolean} [sortDataPoints=false] - Boolean to represent whether the list of datapoints are sorted or not
     */
    public constructor(
        public sender: string,
        public dataPoints: DataPoint[],
        public signalTimestamp: number,
        public serverbeatTag: string,
        public serverbeatSubtag: string,
        sortDataPoints = false
    ) {
        if (sortDataPoints) {
            this.sortDataPoints();
        }
        let prev = null;
        for (const dataPoint of this.dataPoints) {
            if (prev !== null) {
                if (dataPoint.timestamp < prev.timestamp) {
                    throw new Error('timestamps are not in order!');
                }
            }
            prev = dataPoint;
        }
    }
}
