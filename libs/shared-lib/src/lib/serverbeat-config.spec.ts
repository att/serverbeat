import * as moment from 'moment';
import { SubtagType, AlertType, TrafficLight, AlertComparator, ServerbeatTagConfig, ServerbeatSubtagConfig, ServerbeatProjectConfig, AlertConditions, ServerbeatAlertConfig, SnapshotAlertConditions, VariationAlertConditions, AbsoluteSizeAlertConditions } from './serverbeat-configs';
import { ServerbeatAlert, ServerbeatUtil, TimeSeriesSignal } from '@serverbeat/shared-lib';

describe('ServerbeatTagConfig', () => {
    it('should create an instance', () => {
        const tag  = "test_single_signal";
        const sub_tags: any[] = [{"subtagType":"time_series","subtag":"default","displayName":"","isDefault":true,"drawMissing":true}];// [{"subtagType":"time_series","subtag":"default","displayName":"","isDefault":true,"drawMissing":true}];

        const doc = {"type":"time_series","display_name":"Test data for Time Series Signal","description":"This is a test","frequency":60,"tolerance":30,"sla":120,"critical_window":1440,"dependencies":["parent_time_series_signal","another_parent_time_series_signal"]};
        // ServerbeatTagConfig
        const signalConfig = new ServerbeatTagConfig(
            tag,
            doc.display_name,
            doc.description,
            doc.frequency,
            doc.tolerance,
            doc.sla,
            doc.critical_window,
            sub_tags,
            doc.dependencies
        );
        expect(signalConfig.signalDisplayName).toBe(doc.display_name);
    });

    describe('fromJson', () => {
        it('should create an instance the given json', () => {
            const doc = {"signalTag":"test_single_signal","type":"time_series","signalDisplayName":"Test data for Time Series Signal","signalDescription":"This is a test","signalFrequency":60,"signalTolerance":30,"signalSla":120,"signalCriticalWindow":1440,"subtagConfigs":[{"subtagType":"time_series","subtag":"default","displayName":"Test data for Time Series Signal","isDefault":true,"drawMissing":true}],"dependencies":["parent_time_series_signal","another_parent_time_series_signal"]};
            const config = ServerbeatTagConfig.fromJson(doc);
            expect(config.signalDisplayName).toBe(doc.signalDisplayName);
        });

    });

    describe('getDefaultSubtag', () => {
        it('should return default subtag', () => {
            const tag  = "test_single_signal";
            const sub_tags: any[] = [{"subtagType":"time_series","subtag":"default","displayName":"","isDefault":true,"drawMissing":true}];// [{"subtagType":"time_series","subtag":"default","displayName":"","isDefault":true,"drawMissing":true}];

            const doc = {"type":"time_series","display_name":"Test data for Time Series Signal","description":"This is a test","frequency":60,"tolerance":30,"sla":120,"critical_window":1440,"dependencies":["parent_time_series_signal","another_parent_time_series_signal"]};
            // ServerbeatTagConfig
            const signalConfig = new ServerbeatTagConfig(
                tag,
                doc.display_name,
                doc.description,
                doc.frequency,
                doc.tolerance,
                doc.sla,
                doc.critical_window,
                sub_tags,
                doc.dependencies
            );
            // console.log("str", JSON.stringify(signalConfig));
            const defaultSubtag = signalConfig.getDefaultSubtag();
            // console.log("default subtag=====>>", JSON.stringify(defaultSubtag) );
            expect(defaultSubtag.subtag).toBe(sub_tags[0].subtag);
        });

    });
    describe('getSubtagConfig', () => {
        it('should return the SubtagConfig', () => {
            const tag  = "test_single_signal";
            const sub_tags: any[] = [{"subtagType":"time_series","subtag":"default","displayName":"","isDefault":true,"drawMissing":true}];// [{"subtagType":"time_series","subtag":"default","displayName":"","isDefault":true,"drawMissing":true}];
            const doc = {"type":"time_series","display_name":"Test data for Time Series Signal","description":"This is a test","frequency":60,"tolerance":30,"sla":120,"critical_window":1440,"dependencies":["parent_time_series_signal","another_parent_time_series_signal"]};
            const signalConfig = new ServerbeatTagConfig(
                tag,
                doc.display_name,
                doc.description,
                doc.frequency,
                doc.tolerance,
                doc.sla,
                doc.critical_window,
                sub_tags,
                doc.dependencies
            );
               const subtagConfig = signalConfig.getSubtagConfig("default");
                // console.log("getSubtagConfig++++ ", JSON.stringify(subtagConfig));
                expect(subtagConfig.subtagType).toBe(sub_tags[0].subtagType);
        });

    });

    describe('hasSubtag', () => {
        it('should return whether the subtag exists ', () => {
            const tag  = "test_single_signal";
            const sub_tags: any[] = [{"subtagType":"time_series","subtag":"default","displayName":"","isDefault":true,"drawMissing":true}];// [{"subtagType":"time_series","subtag":"default","displayName":"","isDefault":true,"drawMissing":true}];
            const doc = {"type":"time_series","display_name":"Test data for Time Series Signal","description":"This is a test","frequency":60,"tolerance":30,"sla":120,"critical_window":1440,"dependencies":["parent_time_series_signal","another_parent_time_series_signal"]};
            const signalConfig = new ServerbeatTagConfig(
                tag,
                doc.display_name,
                doc.description,
                doc.frequency,
                doc.tolerance,
                doc.sla,
                doc.critical_window,
                sub_tags,
                doc.dependencies
            );
                expect(signalConfig.hasSubtag("default")).toBeTruthy();//.toBe(sub_tags[0].subtagType);
        });

    });
    describe('getCssColorForStatus', () => {
        it('should return the css color for status', () => {
        });

    });
    describe('getCssColorForStatus', () => {
        it('should return the css color for status', () => {
        });

    });
});

describe('ServerbeatSubtagConfig', () => {
    it('should create an instance', () => {
        const doc = {"subtagType":SubtagType.Single,"subtag":"default","displayName":"","isDefault":true,"drawMissing":true};
        const signalConfig = new ServerbeatSubtagConfig(
            doc.subtagType,
            doc.subtag,
            doc.displayName,
            doc.isDefault,
            doc.drawMissing
        );
        expect(signalConfig).toBeTruthy();
    });

    describe('fromJsonAr', () => {
        it('should return an array of ServerbeatSubtagConfig ', () => {
            const ar = [{
                subtagType: "time_series",
                subtag: "default",
                displayName: "Test data for Time Series Signal",
                isDefault: true,
                drawMissing: true
            }];
            const res = ServerbeatSubtagConfig.fromJsonAr(ar);

            expect(res[0].displayName).toBe(ar[0].displayName);
        });

    });

    describe('createDefault', () => {
        it('should return a new instance of ServerbeatSubtagConfig with default subtag', () => {
            const type = SubtagType.Single;
            const subtagConfig = ServerbeatSubtagConfig.createDefault(type);

            expect(subtagConfig.subtagType).toBe(type);
        });
    });

    describe('hasNumericValue', () => {
        it('should return true if the subtag type Timeseries or TimeseriesWithSize', () => {
            const type = SubtagType.SingleWithSize;
            const subtagConfig = ServerbeatSubtagConfig.createDefault(type);

            expect(subtagConfig.hasNumericValue()).toBeTruthy();
        });
    });

    describe('isTimeSeries', () => {
        it('should return true if the subtag type Timeseries or TimeseriesWithSize', () => {
            const type = SubtagType.Timeseries;
            const subtagConfig = ServerbeatSubtagConfig.createDefault(type);

            expect(subtagConfig.isTimeSeries()).toBeTruthy();
        });
    });

    describe('isSingle', () => {
        it('should return true if the subtag type is Single or SingleWithSize', () => {
            const type = SubtagType.Single;
            const subtagConfig = ServerbeatSubtagConfig.createDefault(type);

            expect(subtagConfig.isSingle()).toBeTruthy();
        });
    });
});

describe('ServerbeatProjectConfig', () => {

    it('should create an instance', () => {
        const doc = {"subtagType":SubtagType.Single,"subtag":"default","displayName":"","isDefault":true,"drawMissing":true};
        const serverbeatProjectConfig = new ServerbeatProjectConfig(
           true,
           true
        );
        expect(serverbeatProjectConfig).toBeTruthy();
    });

});

describe('ServerbeatAlert', () => {
    it('should create an instance', () => {
        const traffictLight = TrafficLight.GREEN;
        const message = "no alert is set for this entity";
        const timestamp = 1541101627362;
        const serverbeatAlert = new ServerbeatAlert(
            traffictLight,
            message ,
            timestamp,
        );

        expect(serverbeatAlert).toBeTruthy();
    });


    describe('createGrayAlert', () => {
        it('should return a new instance of ServerbeatSubtagConfig with default subtag', () => {
            const message = "Gray alert message";
            const serverbeatAlert = ServerbeatAlert.createGrayAlert(message);

            expect(serverbeatAlert.message).toBe(message);
        });
    });
});

describe('ServerbeatAlertConfig', () => {
    it('should create an instance', () => {
        const alertName: string = "Running...";
        const type =  AlertType.Snapshot;
        const descrption = "Server state is running";
        const snapshotCount = 234;
        const conditions =  AlertConditions.fromJson({}, AlertType.AbsoluteSize);
        const serverbeatAlertConfig = new ServerbeatAlertConfig(
            alertName,
            type ,
            descrption,
            snapshotCount,
            conditions
        );

        expect(serverbeatAlertConfig).toBeTruthy();
    });

    describe('fromYaml', () => {
        it('should create an instance from the json object', () => {
            const alertName: string = "Running...";
            const doc = { "type" :  AlertType.Snapshot, "descrption" : "Server state is running", "snapshot_count" : 234, "conditions" :  AlertConditions.fromJson({"conditions":{"RED": "server down"}}, AlertType.AbsoluteSize)};
            // const serverbeatAlertConfig = ServerbeatAlertConfig.fromYaml(alertName, doc);
            // expect(serverbeatAlertConfig).toBeTruthy();
        });
    });
});

describe('AlertConditions', () => {
    //Todo: fromYaml

    describe('fromJson', () => {
        it('should return null from the json object', () => {
            const type = AlertType.Snapshot;
            const doc = { "descrption" : "Server state is running", "snapshot_count" : 234, "conditions" :  AlertConditions.fromJson({"conditions":{"RED": "server down"}}, AlertType.AbsoluteSize)};
            const alertConditions = AlertConditions.fromJson(doc, type);

            expect(alertConditions).toBeFalsy();
        });
    });

    describe('fromYaml', () => {
        it('should return null from the json object', () => {
            const type = AlertType.Snapshot;
            const doc = { "descrption" : "Server state is running", "snapshot_count" : 234, "conditions" :  AlertConditions.fromJson({"conditions":{"RED": "server down"}}, AlertType.AbsoluteSize)};
            const alertConditions = AlertConditions.fromJson(doc, type);

            expect(alertConditions).toBeFalsy();
        });
    });

    describe('getLatestApplicableTimestamp', () => {
        it('should return applicable timestamp', () => {
            const sla = 120;
            const type = AlertType.Snapshot;
            const doc = { "descrption" : "Server state is running", "snapshot_count" : 234, "conditions" :  AlertConditions.fromJson({"conditions":{"RED": "server down"}}, AlertType.AbsoluteSize)};
            // const serverbeatAlertConfig = ServerbeatAlertConfig.fromYaml(alertName, doc);
            // expect(serverbeatAlertConfig).toBeTruthy();
            // const alertConditions = AlertConditions.fromJson(doc, type);

            // expect(alertConditions.getLatestApplicableTimestamp(sla)).toBe(ServerbeatUtil.nowInSeconds() - sla*60);
        });
    });
});

describe('SnapshotAlertConditions', () => {

    it('should create an instance', () => {
        const alertName: string = "Running...";
        const type =  AlertType.Snapshot;
        const descrption = "Server state is running";
            const doc = { "RED" : "MISSING|MISSING|MISSING|OK|MISSING>9", "YELLOW" : "MISSING|OK|OK|OK|MISSING>9"};
            const snapshotCount = 234;
        const conditions =  AlertConditions.fromJson({}, AlertType.AbsoluteSize);
        const snapshotAlertConditions = SnapshotAlertConditions.fromYaml(
            doc
        );

        expect(snapshotAlertConditions).toBeTruthy();
    });

    describe('fromYaml', () => {

        it('should create an instance', () => {
            const alertName: string = "Running...";
            const type =  AlertType.Snapshot;
            const descrption = "Server state is running";
                const doc = { "RED" : "MISSING|MISSING|MISSING|OK|MISSING>9", "YELLOW" : "MISSING|OK|OK|OK|MISSING>9"};
                const snapshotCount = 234;
            const conditions =  AlertConditions.fromJson({}, AlertType.AbsoluteSize);
            const snapshotAlertConditions = SnapshotAlertConditions.fromYaml(
                doc
            );

            expect(snapshotAlertConditions).toBeTruthy();
        });
    });


    describe('calculateAlert', () => {
        it('should create an instance of ServerbeatAlert', () => {
            const alertName: string = "Running...";
            const type =  AlertType.Snapshot;
            const descrption = "Server state is running";
                const doc = { "RED" : "MISSING|MISSING|MISSING|OK|MISSING>9", "YELLOW" : "MISSING|OK|OK|OK|MISSING>9"};
                const snapshotCount = 234;
            const conditions =  AlertConditions.fromJson({}, AlertType.AbsoluteSize);
            const snapshotAlertConditions = SnapshotAlertConditions.fromYaml(
                doc
            );
            const timeSeriesSignal = {"id":"test_time_series_signal","label":"Test data for Time Series Signal (1)","position":"server1.example.com","dataPoints":[{"status":"OK","timestamp":1510894800,"message":"partition[201711170000] exists","numericValue":0},{"status":"OK","timestamp":1510981200,"message":"partition[201711180000] exists","numericValue":0},{"status":"OK","timestamp":1511067600,"message":"partition[201711190000] exists","numericValue":0},{"status":"OK","timestamp":1511154000,"message":"partition[201711200000] exists","numericValue":0},{"status":"OK","timestamp":1511240400,"message":"partition[201711210000] exists","numericValue":0}],"tagsAndSenders":[{"sender":"server1.example.com","tag":"test_time_series_signal"}],"width":255.578125,"height":42,"options":{"color":"#a8385d","transform":"translate(20, 120)"},"x":147.7890625,"y":141};
            const serverbeatAlert = snapshotAlertConditions.calculateAlert(120,timeSeriesSignal, 345);



            expect(snapshotAlertConditions).toBeTruthy();
        });

});
});



describe('VariationAlertConditions', () => {

    describe('fromYaml', () => {

        it('should return a null instance', () => {

            expect(VariationAlertConditions.fromYaml(AlertType.AbsoluteSize)).toBeFalsy();
        });
    });


});

describe('AbsoluteSizeAlertConditions', () => {

    describe('fromYaml', () => {

        it('should return a null instance', () => {

            expect(AbsoluteSizeAlertConditions.fromYaml(AlertType.AbsoluteSize)).toBeFalsy();
        });
    });


});
