"use strict";
function pagination(minLimit, maxLimit) {
    maxLimit = maxLimit || minLimit;
    return function middleware(req, res, next) {
        // let page = parseInt(req.body.page, 10) || 1;
        // let limit = parseInt(req.body.limit, 10) || maxLimit;
        // limit = Math.max(Math.min(maxLimit, limit), minLimit);
        let page = 1;
        let limit = maxLimit;
        if(req.query.page){
             page = parseInt(req.query.page, 10) || 1;
        }
        if(req.body.page){
             page = parseInt(req.body.page, 10) || 1;
        }
        if(req.query.limit){
             limit = parseInt(req.query.limit, 10) || maxLimit;
        }
        if(req.body.limit){
            limit = parseInt(req.body.limit, 10) || maxLimit;
        }
        limit = Math.max(Math.min(maxLimit, limit), minLimit);
        req.pagination = {
            page: page,
            limit: limit
        };
        next();
    };
}

module.exports = pagination;