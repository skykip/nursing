"use strict";
const co = require('co');
const _ = require('lodash');
const errors = require('../../errors');
const Test = require('../../models').test;

const findTest = function(req, res, next) {
    let testId = req.params.testId;
    //res.send('respond:'+userId);
    Test.queryById(testId).then(function (test) {
        if (!test) {
            let error = errors.newError(errors.types.TYPE_API_USER_NOT_FOUND);
            return next(error);
        }
        req.targetTest = test;
        next();
    });
};

const getTestById = function(req, res, next) {
  //  res.send('respond:'+req.targetTest);
    return res.jsonp(req.targetTest);
};

const postAddTest = function name(req, res, next) {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
   
    co(function *() {
        let mTest = yield Test.addTest(firstName,lastName);
        return res.jsonp(mTest);
    }).catch(function (err) {
        return next(err);
    });
    
}

const putUpdateTest = function name(req, res, next) {
    let values = _.pickBy(req.body, _.identity);
    req.targetTest.update(values).then(function (test) {
        return res.jsonp(values);
    }).catch(function (err) {
        console.log(err);
        next(err);
    });
}

const patchUpdateTest = function name(req, res, next) {

    let testId = req.params.testId;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    co(function *() {
        let mTest = yield Test.updateTest(testId,firstName,lastName);
        return res.jsonp(mTest);
    }).catch(function (err) {
        return next(err);
    });
}

const deleteTest = function name(req, res, next) {
    let testId = req.params.testId;
    co(function *() {
        let mTest = yield Test.deleteTest(testId);
        return res.jsonp(mTest);
    }).catch(function (err) {
        return next(err);
    });
}

exports.getTestById = [findTest,getTestById];
exports.postAddTest = postAddTest;
exports.putUpdateTest = [findTest,putUpdateTest];
exports.patchUpdateTest = patchUpdateTest;
exports.deleteTest = [findTest,deleteTest];
