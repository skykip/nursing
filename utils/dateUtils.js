"use strict";
const moment = require('moment');

function secondsBetween(startTime, endTime) {
    let timezone = "Asia/Shanghai";
    let start = moment.tz(startTime, timezone);
    let now = moment.tz(endTime, timezone);

    let seconds = moment(now).diff(start, 'seconds');
    return seconds;
}

function daysBetween(startDate, endDate) {
    let startDay = moment(startDate).format("YYYY-MM-DD");
    let endDay = moment(endDate).format("YYYY-MM-DD");
    let days = moment(endDay).diff(startDay, 'days');
    return days;
}

function startAndEndOfTime(time, type) {
    //let start = time.startOf(type).format("YYYY-MM-DD") + " 00:00:00";
    let start = time.startOf(type).clone();
    start.hour(0);
    start.minute(0);
    start.second(0);
    //let end = time.endOf(type).format("YYYY-MM-DD") + " 23:59:59";
    let end = time.endOf(type).clone();
    end.hour(23);
    end.minute(59);
    end.second(59);
    return {
        startTime: start.toDate(),
        endTime: end.toDate()
    };
}

function last7days() {
    //let start = moment().subtract(6, 'days').format("YYYY-MM-DD") + " 00:00:00";
    let start = moment().subtract(6, 'days');
    start.hour(0);
    start.minute(0);
    start.second(0);
    let end = moment();
    return {
        startTime: start,
        endTime: end
    };
}

function isTimeZoneChina(date) {
    date = moment.parseZone(date);
    return date.utcOffset() === 480;
}

function is000000PM(date) {
    date = moment(date);
    let day = moment(date).startOf('day');
    return date.diff(day) === 0;
}

exports.daysBetween = daysBetween;
exports.startAndEnd = startAndEndOfTime;
exports.last7days = last7days;
exports.isTimeZoneChina = isTimeZoneChina;
exports.is000000PM = is000000PM;
exports.secondsBetween = secondsBetween;