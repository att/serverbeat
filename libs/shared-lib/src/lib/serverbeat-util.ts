import * as moment from 'moment';
import { TrafficLight } from './serverbeat-configs';

/**
 * Utility functions for the Serverbeat App.
 * @export
 * @class ServerbeatUtil
 */
export class ServerbeatUtil {
    public static NoAlertColor = 'gray';
    public static AlertCssColors = {
        0: 'green',
        1: 'orange',
        2: 'red',
        '-1': 'gray'
    };

    private static CRUMB_SEPARATOR = '__CRUMB__';

    /**
     * Converts seconds from epoch to a human readable date
     * @param {number} seconds - Number of seconds since epoch
     * @param {*} includeTimezone - whether to attach timezone information to the output string
     * @returns Time in "YYYY-MM-DD hh:mm:ss a Z" or "YYYY-MM-DD hh:mm:ss" format
     */
    public static toReadableDateFormat(seconds: number, includeTimezone) {
        if (includeTimezone) {
            return moment.unix(seconds).format('YYYY-MM-DD hh:mm:ss a Z');
        } else {
            return moment.unix(seconds).format('YYYY-MM-DD HH:mm:ss');
        }
    }

    /**
     * Converts the traffic light status into color value to be used in css
     * @param {TrafficLight} status- traffic light status value
     * @returns {string} CSS color value for status
     */
    public static getCssColorForStatus(status: TrafficLight): string {
        return ServerbeatUtil.AlertCssColors[status];
    }

    /**
     * Join the crumbs with CRUMB_SEPARATOR to generate a path
     * @static
     * @param {string[]} crumbs - array of string values for crumbs
     * @returns {string} The string joined by CRUMB_SEPARATOR
     */
    public static serCrumbs(crumbs: string[]): string {
        return crumbs.join(ServerbeatUtil.CRUMB_SEPARATOR);
    }

    /**
     * Retrieve the list of crumbs from the path `str` seperated by CRUMB_SEPARATOR
     * @param {string} str - string representation of the path
     * @returns {string[]} An array of string values seperated by CRUMB_SEPARATOR
     */
    public static deserCrumbs(str: string): string[] {
        return str.split(ServerbeatUtil.CRUMB_SEPARATOR);
    }

    /**
     * get the number of seconds since epoch
     * @returns {number} Current timestamp in seconds
     */
    public static nowInSeconds(): number {
        return Math.round(new Date().getTime() / 1000);
    }

    /**
     * Translate the minutes into human readable format
     * @param {number} minutes - numerical value for minutes
     * @returns {string} Human readable format value for minutes
     */
    public static humanizeMinutes(minutes: number): string {
        return moment.duration(minutes, 'minutes').humanize();
    }

    /**
     * Retrieve the number of seconds passed the since the beginning of the specified number of days
     * @param {number} days - numeric value for number of days
     * @returns {number} Number of seconds passed since the specified number of days
     */
    public static daysBackInSeconds(days: number): number {
        return Math.round(
            new Date(
                new Date().getTime() - days * 24 * 60 * 60 * 1000
            ).getTime() / 1000
        );
    }
}
