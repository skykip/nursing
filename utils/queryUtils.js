"use strict";
const _ = require('lodash');

const parseQueryIds = function (value) {
    let id = '' + value;
    let ids = id && id.split(',');
    ids = [].concat(ids || []);
    ids = _.map(ids, _.parseInt);
    ids = _.filter(ids, function (value) {
        return !_.isNaN(value);
    });
    ids = _.filter(ids, _.isNumber);
    return ids;
};

const parseQueryStrings = function (value, defaultValues) {
    let values = (typeof value === 'string') && value.split(',');
    values = [].concat(values || (defaultValues ? defaultValues : []));
    if (defaultValues) {
        values = _.filter(values, function (value) {
            return _.indexOf(defaultValues, value) !== -1;
        });
    }
    return values;
};

/**
 * 解析query中的sort字段
 * @param value sort的值
 * @param defaultValue 默认的排序字段, 不能为空
 * @param allFields 所有可排序的字段, 不能为空
 * @returns {Array}
 */
const parseSortString = function (value, defaultValue, allFields) {
    if (!defaultValue) {
        throw new Error("defaultValue is null");
    }
    if (!allFields || !allFields.length) {
        throw new Error ("allFields is null");
    }
    let parse = function (value, allFields) {
        let values = (typeof value === 'string') && value.split(',');
        values = [].concat(values || []);
        let sorts = [];
        values.forEach(function (value) {
            let sort = "ASC";
            value = value.trim();
            if (value.length) {
                if (value[0] === '-') {
                    value = value.slice(1);
                    sort = "DESC";
                } else if (value[0] === '+'){
                    value = value.slice(1);
                }
            }
            if (_.indexOf(allFields, value) !== -1) {
                sorts.push([value, sort]);
            }
        });
        return sorts;
    };
    let sorts = parse(value, allFields);
    if (!sorts.length) {
        sorts = parse(defaultValue, allFields);
    }
    return sorts;
};

exports.parseQueryIds = parseQueryIds;
exports.parseQueryStrings = parseQueryStrings;
exports.parseSortStrings = parseSortString;