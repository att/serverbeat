import * as moment from 'moment';
import { ServerbeatUtil } from '@serverbeat/shared-lib';
import { TrafficLight } from './serverbeat-configs';

describe('ServerbeatUtil', () => {
    it('should create an instance', () => {
        expect(new ServerbeatUtil()).toBeTruthy();
    });

    describe('toReadableDateFormat', () => {
        it('should convert seconds to time format YYYY-MM-DD HH:mm:ss', () => {
            const seconds = new Date().getTime()/1000;
            expect(ServerbeatUtil.toReadableDateFormat(seconds, false)).toEqual(moment.unix(seconds).format('YYYY-MM-DD HH:mm:ss'));
        });

        it('should convert seconds to time format YYYY-MM-DD hh:mm:ss a Z with timezone', () => {
            const seconds = new Date().getTime()/1000;
            expect(ServerbeatUtil.toReadableDateFormat(seconds, true)).toBe(moment.unix(seconds).format('YYYY-MM-DD hh:mm:ss a Z'));
        });
    });

    describe('getCssColorForStatus', () => {
        it('should return the css color for status', () => {
            expect(ServerbeatUtil.getCssColorForStatus(TrafficLight.GREEN)).toBe('green');
        });

    });

    describe('serCrumbs', () => {
        it('should join the string array with CRUMB_SEPARATOR', () => {
            expect(ServerbeatUtil.serCrumbs(['str1', 'str2'])).toBe('str1__CRUMB__str2');
        });
    });

    describe('deserCrumbs', () => {
        it('should split the string with CRUMB_SEPARATOR', () => {
            expect(ServerbeatUtil.deserCrumbs('str1__CRUMB__str2')).toEqual(['str1', 'str2']);
        });
    });

    describe('nowInSeconds', () => {
        it('should return current time in seconds', () => {
            expect(ServerbeatUtil.nowInSeconds()).toBe(Math.round(new Date().getTime() / 1000));
        });
    });

    describe('humanizeMinutes', () => {
        it('should convert the minutes in to human readable format', () => {
            expect(ServerbeatUtil.humanizeMinutes(2)).toBe("2 minutes");
        });

    });

    describe('daysBackInSeconds', () => {
        it('should return the number of seconds from n number of days', () => {
            expect(ServerbeatUtil.daysBackInSeconds(0)).toBe(Math.round(new Date().getTime()/1000));
        });
    });
});
