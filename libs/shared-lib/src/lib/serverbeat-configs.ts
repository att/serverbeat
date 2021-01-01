import { DataPoint, DataPointType, TimeSeriesSignal } from './data-point';
import { ServerbeatUtil } from './serverbeat-util';

/**
 * @enum {number}
 */
export enum SubtagType {
    Timeseries = 'time_series',
    Single = 'single',
    TimeseriesWithSize = 'time_series_with_size',
    SingleWithSize = 'single_with_size'
}

/**
 * @enum {number}
 */
export enum AlertType {
    Snapshot = 'snapshot',
    Variation = 'variation',
    AbsoluteSize = 'absolute_size'
}

/**
 * @enum {number}
 */
export enum TrafficLight {
    GREEN = 0,
    YELLOW = 1,
    RED = 2,
    GRAY = -1
}

/**
 * @enum {number}
 */
export enum AlertComparator {
    LessThan = '<',
    LessThanEqual = '<=',
    MoreThan = '>',
    MoreThanEqual = '>=',
    Equal = '='
}

/**
 * Reprsenets configuration for ServerbeatTag
 * @class ServerbeatTagConfig
 */
export class ServerbeatTagConfig {
    public static MULTI_TYPE = 'multi';

    public static fromJson(obj): ServerbeatTagConfig {
        return new ServerbeatTagConfig(
            obj.signalTag,
            obj.signalDisplayName,
            obj.signalDescription,
            obj.signalFrequency,
            obj.signalTolerance,
            obj.signalSla,
            obj.signalCriticalWindow,
            ServerbeatSubtagConfig.fromJsonAr(obj.subtagConfigs),
            obj.dependencies
        );
    }

    /**
     * Creates an instance of ServerbeatTagConfig.
     * @param {string} signalTag - A string value represents ServerbeatTagConfig
     * @param {string} signalDisplayName - Display name for ServerbeatTagConfig
     * @param {string} signalDescription - Description for ServerbeatTagConfig
     * @param {number} signalFrequency -  A numerical value forsignalFrequency
     * @param {number} signalTolerance -  A numerical value signalTolerance
     * @param {number} signalSla -  A numerical value signalSla
     * @param {number} signalCriticalWindow -  A numerical value signalCriticalWindow
     * @param {ServerbeatSubtagConfig[]} subtagConfigs - List of ServerbeatSubtagConfig for the ServerbeatTagConfig
     * @param {string[]} dependencies - List of string values representing dependencies for the ServerbeatTagConfig
     */
    constructor(
        public signalTag: string,
        public signalDisplayName: string,
        public signalDescription: string,
        public signalFrequency: number,
        public signalTolerance: number,
        public signalSla: number,
        public signalCriticalWindow: number,
        public subtagConfigs: ServerbeatSubtagConfig[],
        public dependencies: string[]
    ) {
        let foundIsDefault = false;
        for (const subtagConfig of subtagConfigs) {
            if (subtagConfig.isDefault) {
                if (foundIsDefault) {
                    throw new Error('only one subtag can be set to default');
                }
                foundIsDefault = true;
            }
        }
        if (!foundIsDefault) {
            throw new Error('one subtag config should be set to default');
        }
    }

    /**
     * Retrieve the default ServerbeatSubtagConfig
     * @returns {ServerbeatSubtagConfig} the default ServerbeatSubtagConfig from the list of ServerbeatSubtagConfigs
     */
    public getDefaultSubtag(): ServerbeatSubtagConfig {
        for (const subtagConfig of this.subtagConfigs) {
            if (subtagConfig.isDefault) {
                return subtagConfig;
            }
        }
        throw new Error('invalid state');
    }

    /**
     *
     * Retrieve the ServerbeatSubtagConfig having the subtag value matched with passed in value
     * @param {string} subtag - String value represents ServerbeatSubtagConfig
     * @returns {ServerbeatSubtagConfig} the ServerbeatSubtagConfig having the subtag value matched with passed in value
     */
    public getSubtagConfig(subtag: string): ServerbeatSubtagConfig {
        for (const subtagConfig of this.subtagConfigs) {
            if (subtagConfig.subtag === subtag) {
                return subtagConfig;
            }
        }
        throw new Error(`invalid subtag[${subtag}] for tag[${this.signalTag}]`);
    }

    /**
     * Confirms whether the ServerbeatSubtagConfig is of subtag with subtag value passed
     * @param {string} subtag - String value represents ServerbeatSubtagConfig
     * @returns {boolean} Whether the ServerbeatSubtagConfig is of subtag value
     */
    public hasSubtag(subtag: string): boolean {
        for (const subtagConfig of this.subtagConfigs) {
            if (subtagConfig.subtag === subtag) {
                return true;
            }
        }
        return false;
    }
}

/**
 * Reprsenets configuration for ServerbeatSubtag
 * @class ServerbeatSubtagConfig
 */
export class ServerbeatSubtagConfig {
    /**
     * Creates a default ServerbeatSubtagConfig
     * @param {SubtagType} type - SubtagType value indicating the type of ServerbeatSubtagConfig
     * @returns {ServerbeatSubtagConfig} - A default ServerbeatSubtagConfig
     */
    public static createDefault(type: SubtagType): ServerbeatSubtagConfig {
        return new ServerbeatSubtagConfig(type, 'default', '', true, true);
    }

    /**
     * Creates An array of ServerbeatSubtagConfig from an arry of json objects
     * @param {any[]} ar - List of objects representing ServerbeatSubtagConfig
     * @returns {ServerbeatSubtagConfig[]} An array of ServerbeatSubtagConfig
     */
    public static fromJsonAr(ar: any[]): ServerbeatSubtagConfig[] {
        const res = [];
        for (const obj of ar) {
            res.push(
                new ServerbeatSubtagConfig(
                    obj.subtagType,
                    obj.subtag,
                    obj.displayName,
                    obj.isDefault,
                    obj.drawMissing
                )
            );
        }
        return res;
    }

    /**
     * Confirms whether the ServerbeatSubtagConfig type is having any of the SingleWithSize or TimeseriesWithSize
     * @returns {boolean} whether the ServerbeatSubtagConfig type is  any of SingleWithSize or TimeseriesWithSize
     */
    public hasNumericValue(): boolean {
        return (
            this.subtagType === SubtagType.SingleWithSize ||
            this.subtagType === SubtagType.TimeseriesWithSize
        );
    }

    /**
     * Confirms whether the ServerbeatSubtagConfig is of type Timeseries or not
     * @returns {boolean} whether the ServerbeatSubtagConfig is of type Timeseries
     */
    public isTimeSeries(): boolean {
        return (
            this.subtagType === SubtagType.Timeseries ||
            this.subtagType === SubtagType.TimeseriesWithSize
        );
    }

    /**
     * Confirms whether the ServerbeatSubtagConfig is of type Single or not
     * @returns {boolean} whether the ServerbeatSubtagConfig is of type Single
     */
    public isSingle(): boolean {
        return (
            this.subtagType === SubtagType.Single ||
            this.subtagType === SubtagType.SingleWithSize
        );
    }

    /**
     * Creates an instance of ServerbeatSubtagConfig.
     * @param {SubtagType} subtagType - SubtagType value indicating the type of ServerbeatSubtagConfig
     * @param {string} subtag - String value represents ServerbeatSubtagConfig
     * @param {string} displayName - display name for ServerbeatSubtagConfig
     * @param {boolean} isDefault - A boolean flag indicates Whether ServerbeatSubtagConfig is a default tag
     * @param {boolean} drawMissing - A boolean flag to show or hide missing DataPoints
     */
    constructor(
        public subtagType: SubtagType,
        public subtag: string,
        public displayName: string,
        public isDefault: boolean,
        public drawMissing: boolean
    ) {}
}

/**
 * @class ServerbeatProjectConfig
 */
export class ServerbeatProjectConfig {
    /**
     *Creates an instance of ServerbeatProjectConfig.
     * @param {boolean} availableViews - A list of available views for the project
     * @param {boolean} defaultView - A string value to default View
     */
    constructor(
        public availableViews ?: any,
        public defaultView ?: string
    ) {}
}

/**
 * Represents Alert information
 * @class ServerbeatAlert
 */
export class ServerbeatAlert {

    /**
     * Creates an ServerbeatAlert with gray value of TrafficLight
     * @param {string} [message=null] - a string value for ServerbeatAlert message
     * @returns {ServerbeatAlert} An instance of ServerbeatAlert with gray value of TrafficLight
     */
    public static createGrayAlert(message: string = null): ServerbeatAlert {
        if (message === null) {
            message = 'no alert is set (or executed) for this entity';
        }

        return new ServerbeatAlert(
            TrafficLight.GRAY,
            message,
            ServerbeatUtil.nowInSeconds()
        );
    }

    /**
     *Creates an instance of ServerbeatAlert.
     * @param {TrafficLight} traffictLight - enum value for traffictLight
     * @param {string} message - a string value for ServerbeatAlert message
     * @param {number} timestamp - a numeric value for timestamp in seconds
     */
    public constructor(
        public traffictLight: TrafficLight,
        public message: string,
        public timestamp: number
    ) {}
}

/**
 * Serverbeat Alert Configuration
 * @class ServerbeatAlertConfig
 */
export class ServerbeatAlertConfig {
    /**
     * Create a new AlertConditions from Yaml configuration
     * @param {string} alertName - Display name for the AlertCondition
     *  @param {*} doc - Yaml configuration for AlertConditions
     * @param {AlertType} type - Indicates the type of alert
     * @returns {AlertConditions} - new AlertConditions as per the Yaml configuration
     */
    public static fromYaml(alertName: string, doc: any): ServerbeatAlertConfig {
        return new ServerbeatAlertConfig(
            alertName,
            doc.type,
            doc.description,
            doc.snapshot_count,
            AlertConditions.fromYaml(doc.conditions, doc.type)
        );
    }

    /**
     * Creates an instance of ServerbeatAlertConfig from the Json
     * @param {*} doc - Json configuration for creation of ServerbeatAlertConfig
     * @returns {ServerbeatAlertConfig} - an ServerbeatAlertConfig object based on Json configuration passed
     */
    public static fromJson(doc: any): ServerbeatAlertConfig {
        return new ServerbeatAlertConfig(
            doc.alertName,
            doc.type,
            doc.description,
            doc.snapshotCount,
            AlertConditions.fromJson(doc.conditions, doc.type)
        );
    }

    /**
     * Creates an instance of ServerbeatAlertConfig.
     * @param {string} alertName - Display name for the ServerbeatAlertConfig
     * @param {AlertType} type - AlertType of ServerbeatAlertConfig
     * @param {string} descrption - Description for ServerbeatAlertConfig
     * @param {number} snapshotCount - numeric value for snapshotCount
     * @param {AlertConditions} conditions - AlertConditions object
     */
    constructor(
        private alertName: string,
        private type: AlertType,
        private descrption: string,
        private snapshotCount: number,
        private conditions: AlertConditions
    ) {
        return null;
    }

    /**
     * Creates ServerbeatAlert object for the timeSeriesSignal
     * @param {number} sla - A numeric value representing the sla in minutes
     * @param {TimeSeriesSignal} timeSeriesSignal
     * @param {number} snapshotCount - Numeric value for the timeSeriesSignal
     * @returns {ServerbeatAlert} - New ServerbeatAlert object for the timeSeriesSignal
     */
    public calculateAlert(
        sla: number,
        timeSeriesSignal: TimeSeriesSignal
    ): ServerbeatAlert {
        return this.conditions.calculateAlert(
            sla,
            timeSeriesSignal,
            this.snapshotCount
        );
    }
}

/**
 * Serverbeat alert conditions
 * @class AlertConditions
 */
export abstract class AlertConditions {
    /**
     * Create a new AlertConditions from Yaml configuration
     *  @param {*} doc - Json configuration for AlertConditions
     * @param {AlertType} type - Indicates the type of alert
     * @returns {AlertConditions} - null or void
     */
    public static fromYaml(doc, type: AlertType): AlertConditions {
        if (type === AlertType.Snapshot) {
            return SnapshotAlertConditions.fromYaml(doc);
        } else if (type === AlertType.AbsoluteSize) {
            return new AbsoluteSizeAlertConditions();
            // throw new Error (`alert type ${type} is not supported!`);
        } else if (type === AlertType.Variation) {
            return new AbsoluteSizeAlertConditions();
            // throw new Error (`alert type ${type} is not supported!`);
        } else {
            throw new Error(`alert type ${type} is not supported!`);
        }
    }

    /**
     * Creates a new AlertConditions object from json.
     * @param {*} doc - Json configuration for AlertConditions
     * @param {AlertType} type - type of AlertConditions
     * @returns {AlertConditions} A new AlertConditions object
     */
    public static fromJson(doc, type: AlertType): AlertConditions {
        return null;
    }

    /**
     * Retrieve the latest applicable timestamp in seconds
     * @param {number} sla - A numeric value representing the sla in minutes
     * @returns {number} latest applicable timestamp in seconds
     */
    public getLatestApplicableTimestamp(sla: number): number {
        const slaSeconds = sla * 60;
        return ServerbeatUtil.nowInSeconds() - slaSeconds;
    }

     /**
     * Creates ServerbeatAlert object for the timeSeriesSignal
     * @param {number} sla - A numeric value representing the sla in minutes
     * @param {TimeSeriesSignal} timeSeriesSignal
     * @param {number} snapshotCount - Numeric value for the timeSeriesSignal
     * @returns {ServerbeatAlert}  New ServerbeatAlert object for the timeSeriesSignal
     */
    public abstract calculateAlert(
        sla: number,
        timeSeriesSignal: TimeSeriesSignal,
        snapshotCount: number
    ): ServerbeatAlert;
}

/**
 * @class SnapshotAlertConditions
 * @extends {AlertConditions}
 */
export class SnapshotAlertConditions extends AlertConditions {
    // TODO: for operators use the enum
    private static SNAPSHOT_RE = /^((?:(?:MISSING|EXPECTED|OK|NOT_OK)\|)*(?:MISSING|EXPECTED|OK|NOT_OK))((?:>=|<=|=|<|>))([0-9]+)$/;

    private redComparator: AlertComparator;
    private redNumber: number;
    private redDataPointTypes: DataPointType[];

    private yellowComparator: AlertComparator;
    private yellowNumber: number;
    private yellowDataPointTypes: DataPointType[];

    /**
     * Create a new AlertConditions from Yaml configuration
     *  @param {*} doc - Yaml configuration for AlertConditions
     * @returns {AlertConditions} - new AlertConditions as per the Yaml configuration
     */
    public static fromYaml(doc: any): AlertConditions {
        let redConditionStr = '';
        let yellowConditionStr = '';

        if (doc['RED']) {
            redConditionStr = doc['RED'].split(' ').join('');
        }
        if (doc['YELLOW']) {
            yellowConditionStr = doc['YELLOW'].split(' ').join('');
        }
        return new SnapshotAlertConditions(redConditionStr, yellowConditionStr);
    }

    /**
     *Creates an instance of SnapshotAlertConditions.
     * @param {string} redConditionStr - string value representing redCondition
     * @param {string} yellowConditionStr - string value representing yellowCondition
     */
    private constructor(redConditionStr: string, yellowConditionStr: string) {
        super();
        const redMatched = redConditionStr.match(
            SnapshotAlertConditions.SNAPSHOT_RE
        );
        const yellowMatched = yellowConditionStr.match(
            SnapshotAlertConditions.SNAPSHOT_RE
        );
        if (redMatched.length !== 4 || yellowMatched.length !== 4) {
            throw new Error('alert is not configured correctly!');
        }

        this.redDataPointTypes = redMatched[1].split('|') as DataPointType[];
        this.redComparator = redMatched[2] as AlertComparator;
        this.redNumber = +redMatched[3];

        this.yellowDataPointTypes = yellowMatched[1].split(
            '|'
        ) as DataPointType[];
        this.yellowComparator = yellowMatched[2] as AlertComparator;
        this.yellowNumber = +yellowMatched[3];
    }

    /**
     * Creates ServerbeatAlert object for the timeSeriesSignal
     * @param {number} sla - A numeric value representing the sla in minutes
     * @param {TimeSeriesSignal} timeSeriesSignal
     * @param {number} snapshotCount - Numeric value for the timeSeriesSignal
     * @returns {ServerbeatAlert} - New ServerbeatAlert object for the timeSeriesSignal
     */
    public calculateAlert(
        sla: number,
        timeSeriesSignal: TimeSeriesSignal,
        snapshotCount: number
    ): ServerbeatAlert {
        let total = 0;
        total = this.matchesLight(
            sla,
            timeSeriesSignal.dataPoints,
            snapshotCount,
            this.redDataPointTypes,
            this.redComparator,
            this.redNumber
        );
        console.log('total for red ' + total + 'snapshots: ' + snapshotCount);
        if (total) {
            return new ServerbeatAlert(
                TrafficLight.RED,
                `${total} for (${this.redDataPointTypes.join('|')}) which is` +
                    ` ${this.redComparator} ${
                        this.redNumber
                    } in the past ${snapshotCount} snapshots`,
                ServerbeatUtil.nowInSeconds()
            );
        }
        console.log(`${total} for (${this.redDataPointTypes.join('|')}) which is
        not ${this.redComparator} ${
            this.redNumber
        } in the past ${snapshotCount} snapshots`);

        total = this.matchesLight(
            sla,
            timeSeriesSignal.dataPoints,
            snapshotCount,
            this.yellowDataPointTypes,
            this.yellowComparator,
            this.yellowNumber
        );
        console.log(
            'total for yellow ' + total + 'snapshots: ' + snapshotCount
        );
        if (total) {
            return new ServerbeatAlert(
                TrafficLight.YELLOW,
                `${total} for (${this.yellowDataPointTypes.join(
                    '|'
                )}) which is` +
                    ` ${this.yellowComparator} ${
                        this.yellowNumber
                    } in the past ${snapshotCount} snapshots`,
                ServerbeatUtil.nowInSeconds()
            );
        }
        console.log(`${total} for (${this.yellowDataPointTypes.join(
            '|'
        )}) which is
        not ${this.yellowComparator} ${
            this.yellowNumber
        } in the past ${snapshotCount} snapshots`);

        return new ServerbeatAlert(
            TrafficLight.GREEN,
            'all good!',
            ServerbeatUtil.nowInSeconds()
        );
    }

    /**
     *
     * Total number of matches from the list of datapoints
     * @param {number} sla - A numeric value representing the sla in minutes
     * @param {DataPoint[]} dataPoints - List of DataPoints
     * @param {number} snapshotCount - snapshotCount
     * @param {DataPointType[]} dataPointTypes - DataPoint types to be matched
     * @param {AlertComparator} comparator - comparison operator
     * @param {number} value - value to compare with
     * @returns The total number of matches
     */
    private matchesLight(
        sla: number,
        dataPoints: DataPoint[],
        snapshotCount: number,
        dataPointTypes: DataPointType[],
        comparator: AlertComparator,
        value: number
    ) {
        const counts = {};

        counts[DataPointType.Ok] = 0;
        counts[DataPointType.NotOk] = 0;
        counts[DataPointType.Artificial] = 0;
        counts[DataPointType.Missing] = 0;
        const latestApplicableTimestamp = this.getLatestApplicableTimestamp(
            sla
        );
        for (let i = dataPoints.length - 1; i >= 0; --i) {
            if (dataPoints[i].timestamp > latestApplicableTimestamp) {
                continue;
            }
            snapshotCount--;
            if (snapshotCount < 0) {
                break;
            }
            counts[dataPoints[i].status] += 1;
        }

        let total = 0;
        for (const curType of dataPointTypes) {
            total += counts[curType];
        }

        let matched = false;
        if (comparator === AlertComparator.Equal) {
            matched = total === value;
        } else if (comparator === AlertComparator.LessThan) {
            matched = total < value;
        } else if (comparator === AlertComparator.LessThanEqual) {
            matched = total <= value;
        } else if (comparator === AlertComparator.MoreThan) {
            matched = total > value;
        } else if (comparator === AlertComparator.MoreThanEqual) {
            matched = total >= value;
        } else {
            throw new Error(`comparator [${comparator}] not supported!`);
        }

        return matched ? total : 0;
    }
}

/**
 * @class VariationAlertConditions
 * @extends {AlertConditions}
 */
export class VariationAlertConditions extends AlertConditions {
    /**
     * Create a new AlertConditions from Yaml configuration
     * @param {AlertType} type - Indicates the type of alert
     * @returns {AlertConditions} - null
     */
    public static fromYaml(type: AlertType): AlertConditions {
        return null;
    }

    /**
     * Creates ServerbeatAlert object for the timeSeriesSignal
     * @param {number} sla - A numeric value representing the sla in minutes
     * @param {TimeSeriesSignal} timeSeriesSignal
     * @param {number} snapshotCount - Numeric value for the timeSeriesSignal
     * @returns {ServerbeatAlert} - New ServerbeatAlert object for the timeSeriesSignal
     */
    calculateAlert(
        sla: number,
        timeSeriesSignal: TimeSeriesSignal,
        snapshotCount: number
    ): ServerbeatAlert {
        return new ServerbeatAlert(
            TrafficLight.GREEN,
            'not implemented!',
            ServerbeatUtil.nowInSeconds()
        );
    }
}

/**
 * @class AbsoluteSizeAlertConditions
 * @extends {AlertConditions}
 */
export class AbsoluteSizeAlertConditions extends AlertConditions {
    /**
     * Create a new AlertConditions from Yaml
     * @param {AlertType} type - Indicates the type of alert
     * @returns {AlertConditions} - null
     */
    public static fromYaml(type: AlertType): AlertConditions {
        return null;
    }

    /**
     * Creates ServerbeatAlert object for the timeSeriesSignal
     * @param {number} sla - A numeric value representing the sla in minutes
     * @param {TimeSeriesSignal} timeSeriesSignal
     * @param {number} snapshotCount - Numeric value for the timeSeriesSignal
     * @returns {ServerbeatAlert} - New ServerbeatAlert object for the timeSeriesSignal
     */
    calculateAlert(
        sla: number,
        timeSeriesSignal: TimeSeriesSignal,
        snapshotCount: number
    ): ServerbeatAlert {
        return new ServerbeatAlert(
            TrafficLight.GREEN,
            'not implemented!',
            ServerbeatUtil.nowInSeconds()
        );
    }
}
