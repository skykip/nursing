"use strict";
function BaseError(status, msg) {
    this.stack = new Error().stack;
    this.msg = msg;
    this.status = status;
}

BaseError.prototype = Object.create(Error.prototype);
BaseError.prototype.name = 'BaseError';

module.exports = BaseError;