import * as moment from 'moment';
import { ServerbeatUtil, DataPoint } from '@serverbeat/shared-lib';
import { TrafficLight } from './serverbeat-configs';
import { DataPointType, OkDataPoint, NotOkDataPoint, MissingDataPoint, ArtificialDataPoint, TimeSeriesSignal } from './data-point';

describe('DataPoint', () => {

    describe('fromJson', () => {
        it('should create an instance', () => {
            const obj = {
                status : DataPointType.Ok,
                timestamp : 1561286774,
                message : "Welcome message",
                numericValue : 234
            };

            expect(DataPoint.fromJson(obj)).toBeTruthy();
        });

    });

    describe('isOk', () => {
        it('should return true', () => {
            const obj = {
                status : DataPointType.Ok,
                timestamp : 1561286774,
                message : "Welcome message",
                numericValue : 234
            };
            const dataPoint = DataPoint.fromJson(obj);

            expect( dataPoint.isOk() ).toBeTruthy();
        });
    });

    describe('isNotOk', () => {
        it('should return true', () => {
            const obj = {
                status : DataPointType.NotOk,
                timestamp : 1561286774,
                message : "Welcome message",
                numericValue : 234
            };
            const dataPoint = DataPoint.fromJson(obj);

            expect(dataPoint.isNotOk()).toBeTruthy();
        });
    });

    describe('isMissing', () => {
        it('should return true', () => {
            const obj = {
                status : DataPointType.Missing,
                timestamp : 1561286774,
                message : "Welcome message",
                numericValue : 234
            };
            const dataPoint = DataPoint.fromJson(obj);

            expect(dataPoint.isMissing()).toBeTruthy();
        });
    });

    describe('isArtificial', () => {
        it('should return true', () => {
            const obj = {
                status : DataPointType.Artificial,
                timestamp : 1561286774,
                message : "Welcome message",
                numericValue : 234
            };
            const dataPoint = DataPoint.fromJson(obj);

            expect(dataPoint.isArtificial()).toBeTruthy();
        });
    });

    describe('toReadableTimestamp', () => {
        it('should return timestamp in format  `YYYY-MM-DD hh:mm:ss a Z`', () => {
            const obj = {
                status : DataPointType.Artificial,
                timestamp : 1561286774,
                message : "Welcome message",
                numericValue : 234
            };
            const dataPoint = DataPoint.fromJson(obj);

            expect( dataPoint.toReadableTimestamp()).toBe( moment.unix(dataPoint.timestamp).format('YYYY-MM-DD hh:mm:ss a Z'));
        });
    });

    describe('getNumericValue', () => {
        it('should return timestamp in format  `YYYY-MM-DD hh:mm:ss a Z`', () => {
            const obj = {
                status : DataPointType.Artificial,
                timestamp : 1561286774,
                message : "Welcome message",
            };
            const dataPoint = DataPoint.fromJson(obj);

            expect( dataPoint.getNumericValue()).toBe(0);
        });
    });
});

describe('OkDataPoint', () => {
    describe('getDisplayName', () => {
        it('should print display name as `OK` ', () => {

            const okDataPoint = new OkDataPoint(
                DataPointType.Ok,
                1561286774,
                "Welcome message",
                234
            );

            expect(okDataPoint.getDisplayName()).toBe('OK');
        });
    });

    describe('getColor', () => {
        it('should return OkDataPoint.COLOR ', () => {

            const okDataPoint = new OkDataPoint(
                DataPointType.Ok,
                1561286774,
                "Welcome message",
                234
            );

            expect(okDataPoint.getColor()).toBe(OkDataPoint.COLOR);
        });
    });
});

describe('NotOkDataPoint', () => {
    describe('getDisplayName', () => {
        it('should print display name as `Not OK` ', () => {

            const notOkDataPoint = new NotOkDataPoint(
                DataPointType.NotOk,
                1561286774,
                "Welcome message",
                234
            );

            expect( notOkDataPoint.getDisplayName() ).toBe('Not OK');
        });
    });

    describe('getColor', () => {
        it('should return NotOkDataPoint.COLOR ', () => {

            const notOkDataPoint = new NotOkDataPoint(
                DataPointType.NotOk,
                1561286774,
                "Welcome message",
                234
            );

            expect( notOkDataPoint.getColor()).toBe(NotOkDataPoint.COLOR);
        });
    });
});

describe('MissingDataPoint', () => {
    describe('getDisplayName', () => {
        it('should print display name as `Missing` ', () => {

            const missingDataPoint = new MissingDataPoint(
                DataPointType.Missing,
                1561286774,
                "Welcome message",
                234
            );

            expect( missingDataPoint.getDisplayName() ).toBe('Missing');
        });
    });

    describe('getColor', () => {
        it('should return MissingDataPoint.COLOR ', () => {

            const missingDataPoint = new MissingDataPoint(
                DataPointType.Missing,
                1561286774,
                "Welcome message",
                234
            );

            expect( missingDataPoint.getColor()).toBe(MissingDataPoint.COLOR);
        });
    });
});

describe('ArtificialDataPoint', () => {
    it('should create an instance', () => {
        const artificialDataPoint = new ArtificialDataPoint(
            1561286774,
            "Welcome message"
        );

        expect(artificialDataPoint).toBeTruthy();
    });

    describe('getDisplayName', () => {
        it('should print display name as `No Signal` ', () => {

            const artificialDataPoint = new ArtificialDataPoint(
                1561286774,
                "Welcome message"
            );

            expect( artificialDataPoint.getDisplayName() ).toBe('No Signal');
        });
    });

    describe('getColor', () => {
        it('should return ArtificialDataPoint.COLOR ', () => {

            const artificialDataPoint = new ArtificialDataPoint(
                1561286774,
                "Welcome message"
            );

            expect( artificialDataPoint.getColor()).toBe( ArtificialDataPoint.COLOR );
        });
    });
});

describe('TimeSeriesSignal', () => {
    const obj = {"sender":"server1.example.com","dataPoints":[{"status":"OK","timestamp":1535778000,"message":"partition[201809010000] exists","numericValue":0},{"status":"OK","timestamp":1535864400,"message":"partition[201809020000] exists","numericValue":0},{"status":"OK","timestamp":1535950800,"message":"partition[201809030000] exists","numericValue":0},{"status":"OK","timestamp":1536037200,"message":"partition[201809040000] exists","numericValue":0},{"status":"OK","timestamp":1536123600,"message":"partition[201809050000] exists","numericValue":0},{"status":"OK","timestamp":1536210000,"message":"partition[201809060000] exists","numericValue":0},{"status":"OK","timestamp":1536296400,"message":"partition[201809070000] exists","numericValue":0},{"status":"OK","timestamp":1536382800,"message":"partition[201809080000] exists","numericValue":0},{"status":"OK","timestamp":1536469200,"message":"partition[201809090000] exists","numericValue":0},{"status":"OK","timestamp":1536555600,"message":"partition[201809100000] exists","numericValue":0},{"status":"OK","timestamp":1536642000,"message":"partition[201809110000] exists","numericValue":0},{"status":"OK","timestamp":1536728400,"message":"partition[201809120000] exists","numericValue":0},{"status":"OK","timestamp":1536814800,"message":"partition[201809130000] exists","numericValue":0},{"status":"OK","timestamp":1536901200,"message":"partition[201809140000] exists","numericValue":0},{"status":"OK","timestamp":1536987600,"message":"partition[201809150000] exists","numericValue":0},{"status":"OK","timestamp":1537074000,"message":"partition[201809160000] exists","numericValue":0},{"status":"OK","timestamp":1537160400,"message":"partition[201809170000] exists","numericValue":0},{"status":"OK","timestamp":1537246800,"message":"partition[201809180000] exists","numericValue":0},{"status":"OK","timestamp":1537333200,"message":"partition[201809190000] exists","numericValue":0},{"status":"OK","timestamp":1537419600,"message":"partition[201809200000] exists","numericValue":0},{"status":"OK","timestamp":1537506000,"message":"partition[201809210000] exists","numericValue":0},{"status":"OK","timestamp":1537592400,"message":"partition[201809220000] exists","numericValue":0},{"status":"OK","timestamp":1537678800,"message":"partition[201809230000] exists","numericValue":0},{"status":"OK","timestamp":1537765200,"message":"partition[201809240000] exists","numericValue":0},{"status":"OK","timestamp":1537851600,"message":"partition[201809250000] exists","numericValue":0},{"status":"OK","timestamp":1537938000,"message":"partition[201809260000] exists","numericValue":0},{"status":"OK","timestamp":1538024400,"message":"partition[201809270000] exists","numericValue":0},{"status":"OK","timestamp":1538110800,"message":"partition[201809280000] exists","numericValue":0},{"status":"OK","timestamp":1538197200,"message":"partition[201809290000] exists","numericValue":0},{"status":"OK","timestamp":1538283600,"message":"partition[201809300000] exists","numericValue":0},{"status":"OK","timestamp":1538370000,"message":"partition[201810010000] exists","numericValue":0},{"status":"OK","timestamp":1538456400,"message":"partition[201810020000] exists","numericValue":0},{"status":"OK","timestamp":1538542800,"message":"partition[201810030000] exists","numericValue":0},{"status":"OK","timestamp":1538629200,"message":"partition[201810040000] exists","numericValue":0},{"status":"OK","timestamp":1538715600,"message":"partition[201810050000] exists","numericValue":0},{"status":"OK","timestamp":1538802000,"message":"partition[201810060000] exists","numericValue":0},{"status":"OK","timestamp":1538888400,"message":"partition[201810070000] exists","numericValue":0},{"status":"OK","timestamp":1538974800,"message":"partition[201810080000] exists","numericValue":0},{"status":"OK","timestamp":1539061200,"message":"partition[201810090000] exists","numericValue":0},{"status":"OK","timestamp":1539147600,"message":"partition[201810100000] exists","numericValue":0},{"status":"OK","timestamp":1539234000,"message":"partition[201810110000] exists","numericValue":0},{"status":"OK","timestamp":1539320400,"message":"partition[201810120000] exists","numericValue":0},{"status":"OK","timestamp":1539406800,"message":"partition[201810130000] exists","numericValue":0},{"status":"OK","timestamp":1539493200,"message":"partition[201810140000] exists","numericValue":0},{"status":"OK","timestamp":1539579600,"message":"partition[201810150000] exists","numericValue":0},{"status":"OK","timestamp":1539666000,"message":"partition[201810160000] exists","numericValue":0},{"status":"OK","timestamp":1539752400,"message":"partition[201810170000] exists","numericValue":0},{"status":"OK","timestamp":1539838800,"message":"partition[201810180000] exists","numericValue":0},{"status":"OK","timestamp":1539925200,"message":"partition[201810190000] exists","numericValue":0},{"status":"OK","timestamp":1540011600,"message":"partition[201810200000] exists","numericValue":0},{"status":"OK","timestamp":1540098000,"message":"partition[201810210000] exists","numericValue":0},{"status":"OK","timestamp":1540184400,"message":"partition[201810220000] exists","numericValue":0},{"status":"OK","timestamp":1540270800,"message":"partition[201810230000] exists","numericValue":0},{"status":"OK","timestamp":1540357200,"message":"partition[201810240000] exists","numericValue":0},{"status":"OK","timestamp":1540443600,"message":"partition[201810250000] exists","numericValue":0},{"status":"OK","timestamp":1540530000,"message":"partition[201810260000] exists","numericValue":0},{"status":"OK","timestamp":1540616400,"message":"partition[201810270000] exists","numericValue":0},{"status":"OK","timestamp":1540702800,"message":"partition[201810280000] exists","numericValue":0},{"status":"OK","timestamp":1540789200,"message":"partition[201810290000] exists","numericValue":0},{"status":"OK","timestamp":1540875600,"message":"partition[201810300000] exists","numericValue":0},{"status":"OK","timestamp":1540962000,"message":"partition[201810310000] exists","numericValue":0},{"status":"OK","timestamp":1541048400,"message":"partition[201811010000] exists","numericValue":0},{"status":"OK","timestamp":1541134800,"message":"partition[201811020000] exists","numericValue":0},{"status":"OK","timestamp":1541221200,"message":"partition[201811030000] exists","numericValue":0},{"status":"OK","timestamp":1541307600,"message":"partition[201811040000] exists","numericValue":0},{"status":"OK","timestamp":1541394000,"message":"partition[201811050000] exists","numericValue":0},{"status":"OK","timestamp":1541480400,"message":"partition[201811060000] exists","numericValue":0},{"status":"OK","timestamp":1541566800,"message":"partition[201811070000] exists","numericValue":0},{"status":"OK","timestamp":1541653200,"message":"partition[201811080000] exists","numericValue":0},{"status":"OK","timestamp":1541739600,"message":"partition[201811090000] exists","numericValue":0},{"status":"OK","timestamp":1541826000,"message":"partition[201811100000] exists","numericValue":0},{"status":"OK","timestamp":1541912400,"message":"partition[201811110000] exists","numericValue":0},{"status":"OK","timestamp":1541998800,"message":"partition[201811120000] exists","numericValue":0},{"status":"OK","timestamp":1542085200,"message":"partition[201811130000] exists","numericValue":0},{"status":"OK","timestamp":1542171600,"message":"partition[201811140000] exists","numericValue":0},{"status":"OK","timestamp":1542258000,"message":"partition[201811150000] exists","numericValue":0},{"status":"OK","timestamp":1542344400,"message":"partition[201811160000] exists","numericValue":0},{"status":"OK","timestamp":1542430800,"message":"partition[201811170000] exists","numericValue":0},{"status":"OK","timestamp":1542517200,"message":"partition[201811180000] exists","numericValue":0},{"status":"OK","timestamp":1542603600,"message":"partition[201811190000] exists","numericValue":0},{"status":"OK","timestamp":1542690000,"message":"partition[201811200000] exists","numericValue":0},{"status":"OK","timestamp":1542776400,"message":"partition[201811210000] exists","numericValue":0},{"status":"OK","timestamp":1542862800,"message":"partition[201811220000] exists","numericValue":0},{"status":"OK","timestamp":1542949200,"message":"partition[201811230000] exists","numericValue":0},{"status":"OK","timestamp":1543035600,"message":"partition[201811240000] exists","numericValue":0},{"status":"OK","timestamp":1543122000,"message":"partition[201811250000] exists","numericValue":0},{"status":"OK","timestamp":1543208400,"message":"partition[201811260000] exists","numericValue":0},{"status":"OK","timestamp":1543294800,"message":"partition[201811270000] exists","numericValue":0},{"status":"OK","timestamp":1543381200,"message":"partition[201811280000] exists","numericValue":0},{"status":"OK","timestamp":1543467600,"message":"partition[201811290000] exists","numericValue":0},{"status":"OK","timestamp":1543554000,"message":"partition[201811300000] exists","numericValue":0},{"status":"OK","timestamp":1543640400,"message":"partition[201812010000] exists","numericValue":0},{"status":"OK","timestamp":1543726800,"message":"partition[201812020000] exists","numericValue":0},{"status":"OK","timestamp":1543813200,"message":"partition[201812030000] exists","numericValue":0},{"status":"OK","timestamp":1543899600,"message":"partition[201812040000] exists","numericValue":0},{"status":"OK","timestamp":1543986000,"message":"partition[201812050000] exists","numericValue":0},{"status":"OK","timestamp":1544072400,"message":"partition[201812060000] exists","numericValue":0},{"status":"OK","timestamp":1544158800,"message":"partition[201812070000] exists","numericValue":0},{"status":"OK","timestamp":1544245200,"message":"partition[201812080000] exists","numericValue":0},{"status":"OK","timestamp":1544331600,"message":"partition[201812090000] exists","numericValue":0},{"status":"OK","timestamp":1544418000,"message":"partition[201812100000] exists","numericValue":0},{"status":"OK","timestamp":1544504400,"message":"partition[201812110000] exists","numericValue":0},{"status":"OK","timestamp":1544590800,"message":"partition[201812120000] exists","numericValue":0},{"status":"OK","timestamp":1544677200,"message":"partition[201812130000] exists","numericValue":0},{"status":"OK","timestamp":1544763600,"message":"partition[201812140000] exists","numericValue":0},{"status":"OK","timestamp":1544850000,"message":"partition[201812150000] exists","numericValue":0},{"status":"OK","timestamp":1544936400,"message":"partition[201812160000] exists","numericValue":0},{"status":"OK","timestamp":1545022800,"message":"partition[201812170000] exists","numericValue":0},{"status":"OK","timestamp":1545109200,"message":"partition[201812180000] exists","numericValue":0},{"status":"OK","timestamp":1545195600,"message":"partition[201812190000] exists","numericValue":0},{"status":"OK","timestamp":1545282000,"message":"partition[201812200000] exists","numericValue":0},{"status":"OK","timestamp":1545368400,"message":"partition[201812210000] exists","numericValue":0},{"status":"OK","timestamp":1545454800,"message":"partition[201812220000] exists","numericValue":0},{"status":"OK","timestamp":1545541200,"message":"partition[201812230000] exists","numericValue":0},{"status":"OK","timestamp":1545627600,"message":"partition[201812240000] exists","numericValue":0},{"status":"OK","timestamp":1545714000,"message":"partition[201812250000] exists","numericValue":0},{"status":"OK","timestamp":1545800400,"message":"partition[201812260000] exists","numericValue":0},{"status":"OK","timestamp":1545886800,"message":"partition[201812270000] exists","numericValue":0},{"status":"OK","timestamp":1545973200,"message":"partition[201812280000] exists","numericValue":0},{"status":"OK","timestamp":1546059600,"message":"partition[201812290000] exists","numericValue":0},{"status":"OK","timestamp":1546146000,"message":"partition[201812300000] exists","numericValue":0},{"status":"OK","timestamp":1546232400,"message":"partition[201812310000] exists","numericValue":0},{"status":"OK","timestamp":1546318800,"message":"partition[201901010000] exists","numericValue":0},{"status":"OK","timestamp":1546405200,"message":"partition[201901020000] exists","numericValue":0},{"status":"OK","timestamp":1546491600,"message":"partition[201901030000] exists","numericValue":0},{"status":"OK","timestamp":1546578000,"message":"partition[201901040000] exists","numericValue":0},{"status":"OK","timestamp":1546664400,"message":"partition[201901050000] exists","numericValue":0},{"status":"OK","timestamp":1546750800,"message":"partition[201901060000] exists","numericValue":0},{"status":"OK","timestamp":1546837200,"message":"partition[201901070000] exists","numericValue":0},{"status":"OK","timestamp":1546923600,"message":"partition[201901080000] exists","numericValue":0},{"status":"OK","timestamp":1547010000,"message":"partition[201901090000] exists","numericValue":0},{"status":"OK","timestamp":1547096400,"message":"partition[201901100000] exists","numericValue":0},{"status":"OK","timestamp":1547182800,"message":"partition[201901110000] exists","numericValue":0},{"status":"OK","timestamp":1547269200,"message":"partition[201901120000] exists","numericValue":0},{"status":"OK","timestamp":1547355600,"message":"partition[201901130000] exists","numericValue":0},{"status":"OK","timestamp":1547442000,"message":"partition[201901140000] exists","numericValue":0},{"status":"OK","timestamp":1547528400,"message":"partition[201901150000] exists","numericValue":0},{"status":"OK","timestamp":1547614800,"message":"partition[201901160000] exists","numericValue":0},{"status":"OK","timestamp":1547701200,"message":"partition[201901170000] exists","numericValue":0},{"status":"OK","timestamp":1547787600,"message":"partition[201901180000] exists","numericValue":0},{"status":"OK","timestamp":1547874000,"message":"partition[201901190000] exists","numericValue":0},{"status":"OK","timestamp":1547960400,"message":"partition[201901200000] exists","numericValue":0},{"status":"OK","timestamp":1548046800,"message":"partition[201901210000] exists","numericValue":0},{"status":"OK","timestamp":1548133200,"message":"partition[201901220000] exists","numericValue":0},{"status":"OK","timestamp":1548219600,"message":"partition[201901230000] exists","numericValue":0},{"status":"OK","timestamp":1548306000,"message":"partition[201901240000] exists","numericValue":0},{"status":"OK","timestamp":1548392400,"message":"partition[201901250000] exists","numericValue":0},{"status":"OK","timestamp":1548478800,"message":"partition[201901260000] exists","numericValue":0},{"status":"OK","timestamp":1548565200,"message":"partition[201901270000] exists","numericValue":0},{"status":"OK","timestamp":1548651600,"message":"partition[201901280000] exists","numericValue":0},{"status":"OK","timestamp":1548738000,"message":"partition[201901290000] exists","numericValue":0},{"status":"OK","timestamp":1548824400,"message":"partition[201901300000] exists","numericValue":0},{"status":"OK","timestamp":1548910800,"message":"partition[201901310000] exists","numericValue":0},{"status":"OK","timestamp":1548997200,"message":"partition[201902010000] exists","numericValue":0},{"status":"OK","timestamp":1549083600,"message":"partition[201902020000] exists","numericValue":0},{"status":"OK","timestamp":1549170000,"message":"partition[201902030000] exists","numericValue":0},{"status":"OK","timestamp":1549256400,"message":"partition[201902040000] exists","numericValue":0},{"status":"OK","timestamp":1549342800,"message":"partition[201902050000] exists","numericValue":0},{"status":"OK","timestamp":1549429200,"message":"partition[201902060000] exists","numericValue":0},{"status":"OK","timestamp":1549515600,"message":"partition[201902070000] exists","numericValue":0},{"status":"OK","timestamp":1549602000,"message":"partition[201902080000] exists","numericValue":0},{"status":"OK","timestamp":1549688400,"message":"partition[201902090000] exists","numericValue":0},{"status":"OK","timestamp":1549774800,"message":"partition[201902100000] exists","numericValue":0},{"status":"OK","timestamp":1549861200,"message":"partition[201902110000] exists","numericValue":0},{"status":"OK","timestamp":1549947600,"message":"partition[201902120000] exists","numericValue":0},{"status":"OK","timestamp":1550034000,"message":"partition[201902130000] exists","numericValue":0},{"status":"OK","timestamp":1550120400,"message":"partition[201902140000] exists","numericValue":0},{"status":"OK","timestamp":1550206800,"message":"partition[201902150000] exists","numericValue":0},{"status":"OK","timestamp":1550293200,"message":"partition[201902160000] exists","numericValue":0},{"status":"OK","timestamp":1550379600,"message":"partition[201902170000] exists","numericValue":0},{"status":"OK","timestamp":1550466000,"message":"partition[201902180000] exists","numericValue":0},{"status":"OK","timestamp":1550552400,"message":"partition[201902190000] exists","numericValue":0},{"status":"OK","timestamp":1550638800,"message":"partition[201902200000] exists","numericValue":0},{"status":"OK","timestamp":1550725200,"message":"partition[201902210000] exists","numericValue":0},{"status":"OK","timestamp":1550811600,"message":"partition[201902220000] exists","numericValue":0},{"status":"OK","timestamp":1550898000,"message":"partition[201902230000] exists","numericValue":0},{"status":"OK","timestamp":1550984400,"message":"partition[201902240000] exists","numericValue":0},{"status":"OK","timestamp":1551070800,"message":"partition[201902250000] exists","numericValue":0},{"status":"OK","timestamp":1551157200,"message":"partition[201902260000] exists","numericValue":0},{"status":"OK","timestamp":1551243600,"message":"partition[201902270000] exists","numericValue":0},{"status":"OK","timestamp":1551330000,"message":"partition[201902280000] exists","numericValue":0},{"status":"OK","timestamp":1551416400,"message":"partition[201903010000] exists","numericValue":0},{"status":"OK","timestamp":1551502800,"message":"partition[201903020000] exists","numericValue":0},{"status":"OK","timestamp":1551589200,"message":"partition[201903030000] exists","numericValue":0},{"status":"OK","timestamp":1551675600,"message":"partition[201903040000] exists","numericValue":0},{"status":"OK","timestamp":1551762000,"message":"partition[201903050000] exists","numericValue":0},{"status":"OK","timestamp":1551848400,"message":"partition[201903060000] exists","numericValue":0},{"status":"OK","timestamp":1551934800,"message":"partition[201903070000] exists","numericValue":0},{"status":"OK","timestamp":1552021200,"message":"partition[201903080000] exists","numericValue":0},{"status":"OK","timestamp":1552107600,"message":"partition[201903090000] exists","numericValue":0},{"status":"OK","timestamp":1552194000,"message":"partition[201903100000] exists","numericValue":0},{"status":"OK","timestamp":1552280400,"message":"partition[201903110000] exists","numericValue":0},{"status":"OK","timestamp":1552366800,"message":"partition[201903120000] exists","numericValue":0},{"status":"OK","timestamp":1552453200,"message":"partition[201903130000] exists","numericValue":0},{"status":"OK","timestamp":1552539600,"message":"partition[201903140000] exists","numericValue":0},{"status":"OK","timestamp":1552626000,"message":"partition[201903150000] exists","numericValue":0},{"status":"OK","timestamp":1552712400,"message":"partition[201903160000] exists","numericValue":0},{"status":"OK","timestamp":1552798800,"message":"partition[201903170000] exists","numericValue":0},{"status":"OK","timestamp":1552885200,"message":"partition[201903180000] exists","numericValue":0},{"status":"OK","timestamp":1552971600,"message":"partition[201903190000] exists","numericValue":0},{"status":"OK","timestamp":1553058000,"message":"partition[201903200000] exists","numericValue":0},{"status":"OK","timestamp":1553144400,"message":"partition[201903210000] exists","numericValue":0},{"status":"OK","timestamp":1553230800,"message":"partition[201903220000] exists","numericValue":0},{"status":"OK","timestamp":1553317200,"message":"partition[201903230000] exists","numericValue":0},{"status":"OK","timestamp":1553403600,"message":"partition[201903240000] exists","numericValue":0},{"status":"OK","timestamp":1553490000,"message":"partition[201903250000] exists","numericValue":0},{"status":"OK","timestamp":1553576400,"message":"partition[201903260000] exists","numericValue":0},{"status":"OK","timestamp":1553662800,"message":"partition[201903270000] exists","numericValue":0},{"status":"OK","timestamp":1553749200,"message":"partition[201903280000] exists","numericValue":0},{"status":"OK","timestamp":1553835600,"message":"partition[201903290000] exists","numericValue":0},{"status":"OK","timestamp":1553922000,"message":"partition[201903300000] exists","numericValue":0},{"status":"OK","timestamp":1554008400,"message":"partition[201903310000] exists","numericValue":0},{"status":"OK","timestamp":1554094800,"message":"partition[201904010000] exists","numericValue":0},{"status":"OK","timestamp":1554181200,"message":"partition[201904020000] exists","numericValue":0},{"status":"OK","timestamp":1554267600,"message":"partition[201904030000] exists","numericValue":0},{"status":"OK","timestamp":1554354000,"message":"partition[201904040000] exists","numericValue":0},{"status":"OK","timestamp":1554440400,"message":"partition[201904050000] exists","numericValue":0},{"status":"OK","timestamp":1554526800,"message":"partition[201904060000] exists","numericValue":0},{"status":"OK","timestamp":1554613200,"message":"partition[201904070000] exists","numericValue":0},{"status":"OK","timestamp":1554699600,"message":"partition[201904080000] exists","numericValue":0},{"status":"OK","timestamp":1554786000,"message":"partition[201904090000] exists","numericValue":0},{"status":"OK","timestamp":1554872400,"message":"partition[201904100000] exists","numericValue":0},{"status":"OK","timestamp":1554958800,"message":"partition[201904110000] exists","numericValue":0},{"status":"OK","timestamp":1555045200,"message":"partition[201904120000] exists","numericValue":0},{"status":"OK","timestamp":1555131600,"message":"partition[201904130000] exists","numericValue":0},{"status":"OK","timestamp":1555218000,"message":"partition[201904140000] exists","numericValue":0},{"status":"OK","timestamp":1555304400,"message":"partition[201904150000] exists","numericValue":0},{"status":"OK","timestamp":1555390800,"message":"partition[201904160000] exists","numericValue":0},{"status":"OK","timestamp":1555477200,"message":"partition[201904170000] exists","numericValue":0},{"status":"OK","timestamp":1555563600,"message":"partition[201904180000] exists","numericValue":0},{"status":"OK","timestamp":1555650000,"message":"partition[201904190000] exists","numericValue":0},{"status":"OK","timestamp":1555736400,"message":"partition[201904200000] exists","numericValue":0},{"status":"OK","timestamp":1555822800,"message":"partition[201904210000] exists","numericValue":0},{"status":"OK","timestamp":1555909200,"message":"partition[201904220000] exists","numericValue":0},{"status":"OK","timestamp":1555995600,"message":"partition[201904230000] exists","numericValue":0},{"status":"OK","timestamp":1556082000,"message":"partition[201904240000] exists","numericValue":0},{"status":"OK","timestamp":1556168400,"message":"partition[201904250000] exists","numericValue":0},{"status":"OK","timestamp":1556254800,"message":"partition[201904260000] exists","numericValue":0},{"status":"OK","timestamp":1556341200,"message":"partition[201904270000] exists","numericValue":0},{"status":"OK","timestamp":1556427600,"message":"partition[201904280000] exists","numericValue":0},{"status":"OK","timestamp":1556514000,"message":"partition[201904290000] exists","numericValue":0},{"status":"OK","timestamp":1556600400,"message":"partition[201904300000] exists","numericValue":0},{"status":"OK","timestamp":1556686800,"message":"partition[201905010000] exists","numericValue":0},{"status":"OK","timestamp":1556773200,"message":"partition[201905020000] exists","numericValue":0},{"status":"OK","timestamp":1556859600,"message":"partition[201905030000] exists","numericValue":0},{"status":"OK","timestamp":1556946000,"message":"partition[201905040000] exists","numericValue":0},{"status":"OK","timestamp":1557032400,"message":"partition[201905050000] exists","numericValue":0},{"status":"OK","timestamp":1557118800,"message":"partition[201905060000] exists","numericValue":0},{"status":"OK","timestamp":1557205200,"message":"partition[201905070000] exists","numericValue":0},{"status":"OK","timestamp":1557291600,"message":"partition[201905080000] exists","numericValue":0},{"status":"OK","timestamp":1557378000,"message":"partition[201905090000] exists","numericValue":0},{"status":"OK","timestamp":1557464400,"message":"partition[201905100000] exists","numericValue":0},{"status":"OK","timestamp":1557550800,"message":"partition[201905110000] exists","numericValue":0},{"status":"OK","timestamp":1557637200,"message":"partition[201905120000] exists","numericValue":0},{"status":"OK","timestamp":1557723600,"message":"partition[201905130000] exists","numericValue":0},{"status":"OK","timestamp":1557810000,"message":"partition[201905140000] exists","numericValue":0},{"status":"OK","timestamp":1557896400,"message":"partition[201905150000] exists","numericValue":0},{"status":"OK","timestamp":1557982800,"message":"partition[201905160000] exists","numericValue":0},{"status":"OK","timestamp":1558069200,"message":"partition[201905170000] exists","numericValue":0},{"status":"OK","timestamp":1558155600,"message":"partition[201905180000] exists","numericValue":0},{"status":"OK","timestamp":1558242000,"message":"partition[201905190000] exists","numericValue":0},{"status":"OK","timestamp":1558328400,"message":"partition[201905200000] exists","numericValue":0},{"status":"OK","timestamp":1558414800,"message":"partition[201905210000] exists","numericValue":0},{"status":"OK","timestamp":1558501200,"message":"partition[201905220000] exists","numericValue":0},{"status":"OK","timestamp":1558587600,"message":"partition[201905230000] exists","numericValue":0},{"status":"OK","timestamp":1558674000,"message":"partition[201905240000] exists","numericValue":0},{"status":"OK","timestamp":1558760400,"message":"partition[201905250000] exists","numericValue":0},{"status":"OK","timestamp":1558846800,"message":"partition[201905260000] exists","numericValue":0},{"status":"OK","timestamp":1558933200,"message":"partition[201905270000] exists","numericValue":0},{"status":"OK","timestamp":1559019600,"message":"partition[201905280000] exists","numericValue":0},{"status":"OK","timestamp":1559106000,"message":"partition[201905290000] exists","numericValue":0},{"status":"OK","timestamp":1559192400,"message":"partition[201905300000] exists","numericValue":0},{"status":"OK","timestamp":1559278800,"message":"partition[201905310000] exists","numericValue":0},{"status":"OK","timestamp":1559365200,"message":"partition[201906010000] exists","numericValue":0},{"status":"OK","timestamp":1559451600,"message":"partition[201906020000] exists","numericValue":0},{"status":"OK","timestamp":1559538000,"message":"partition[201906030000] exists","numericValue":0},{"status":"OK","timestamp":1559624400,"message":"partition[201906040000] exists","numericValue":0},{"status":"OK","timestamp":1559710800,"message":"partition[201906050000] exists","numericValue":0},{"status":"OK","timestamp":1559797200,"message":"partition[201906060000] exists","numericValue":0},{"status":"OK","timestamp":1559883600,"message":"partition[201906070000] exists","numericValue":0},{"status":"OK","timestamp":1559970000,"message":"partition[201906080000] exists","numericValue":0},{"status":"OK","timestamp":1560056400,"message":"partition[201906090000] exists","numericValue":0},{"status":"OK","timestamp":1560142800,"message":"partition[201906100000] exists","numericValue":0},{"status":"OK","timestamp":1560229200,"message":"partition[201906110000] exists","numericValue":0},{"status":"OK","timestamp":1560315600,"message":"partition[201906120000] exists","numericValue":0},{"status":"OK","timestamp":1560402000,"message":"partition[201906130000] exists","numericValue":0},{"status":"OK","timestamp":1560488400,"message":"partition[201906140000] exists","numericValue":0},{"status":"OK","timestamp":1560574800,"message":"partition[201906150000] exists","numericValue":0},{"status":"OK","timestamp":1560661200,"message":"partition[201906160000] exists","numericValue":0},{"status":"OK","timestamp":1560747600,"message":"partition[201906170000] exists","numericValue":0},{"status":"OK","timestamp":1560834000,"message":"partition[201906180000] exists","numericValue":0},{"status":"OK","timestamp":1560920400,"message":"partition[201906190000] exists","numericValue":0},{"status":"OK","timestamp":1561006800,"message":"partition[201906200000] exists","numericValue":0},{"status":"MISSING","timestamp":1561093200,"message":"partition[201906210000] does not exist","numericValue":0},{"status":"MISSING","timestamp":1561179600,"message":"partition[201906220000] does not exist","numericValue":0}],"signalTimestamp":1561209044,"serverbeatTag":"rg_history","serverbeatSubtag":"hdfs_partitions"};
    it('should create an instance', () => {
        const timeSeriesSignal = new TimeSeriesSignal(
            obj.sender,
            [],
            obj.signalTimestamp,
            obj.serverbeatTag,
            obj.serverbeatSubtag,
            false
        );

        expect(timeSeriesSignal).toBeTruthy();
    });

    describe('fromJson', () => {
        it(' should create an instance from json', () => {
            const timeSeriesSignal = TimeSeriesSignal.fromJson(obj, false);

            expect( timeSeriesSignal ).toBeTruthy();
        });
    });

    describe('fillInTheBlank', () => {
        it('should fill the empty space for the expected data points ', () => {
            const timeSeriesSignal = TimeSeriesSignal.fromJson(obj, false);
            timeSeriesSignal.fillInTheBlank(
                5,
                5,
                120,
                20
            );

            expect( timeSeriesSignal.dataPoints[2000].timestamp ).toBe(1536379800);
        });
    });



    describe('sortDataPoints', () => {
        it('should sort the datapoints in asc order ', () => {
            const datapointJson = {
                status : DataPointType.Ok,
                timestamp : 1532355034,
                message : "partition[201809010000] exists",
                numericValue : 0
            };
            const dataPoint = DataPoint.fromJson(datapointJson);
            const timeSeriesSignal = TimeSeriesSignal.fromJson(obj, false);
            timeSeriesSignal.dataPoints.push(dataPoint);

            timeSeriesSignal.sortDataPoints();

            expect( timeSeriesSignal.dataPoints[0].timestamp ).toBe(1532355034);
        });
    });
});
