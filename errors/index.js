"use strict";
const BaseError = require('./base-error');

function newError(type) {
    if (!type) {
        throw new Error("Type can not be null");
    }

    if (typeof type === 'string') {
        if (!types[type]) {
            throw new Error("Type unknown");
        }
        type = types[type];
    }

    return new BaseError(type.status, type.msg);
}

function wrapError(e) {
    let type = types[e.message];
    type = type || types.TYPE_API_INTERNAL_SERVER_ERROR;
    return newError(type);
}

const types = {
    // Base HTTP Error
    TYPE_API_BAD_REQUEST: {
        msg: 'error.api.general.badRequest',
        status: 400,
        toString: function () {
            return "TYPE_API_BAD_REQUEST";
        }
    },
    TYPE_API_UNAUTHORIZED: {
        msg: 'error.api.general.unauthorized',
        status: 401,
        toString: function () {
            return "TYPE_API_UNAUTHORIZED";
        }
    },
    TYPE_API_FORBIDDEN: {
        msg: 'error.api.general.forbidden',
        status: 403,
        toString: function () {
            return "TYPE_API_FORBIDDEN";
        }
    },
    TYPE_API_NOT_FOUND: {
        msg: 'error.api.general.notFound',
        status: 404,
        toString: function () {
            return "TYPE_API_NOT_FOUND";
        }
    },
    TYPE_API_CONFLICT: {
        msg: 'error.api.general.conflict',
        status: 409,
        toString: function () {
            return "TYPE_API_CONFLICT";
        }
    },
    TYPE_API_INTERNAL_SERVER_ERROR: {
        msg: 'error.api.general.internalServerError',
        status: 500,
        toString: function () {
            return "TYPE_API_INTERNAL_SERVER_ERROR";
        }
    },

    // Wechat
    TYPE_API_WECHAT_AUTH_NO_CODE: {
        msg: 'error.api.wechat.auth.noCode',
        status: 400,
        toString: function () {
            return "TYPE_API_WECHAT_AUTH_NO_CODE";
        }
    },

    TYPE_API_WECHAT_AUTH_GET_ACCESS_TOKEN_FAILED: {
        msg: 'error.api.wechat.auth.getAccessTokenFailed',
        status: 400,
        toString: function () {
            return "TYPE_API_WECHAT_AUTH_GET_ACCESS_TOKEN_FAILED";
        }
    },

    // Auth
    TYPE_API_AUTH_EXPIRED_TOKEN: {
        msg: 'error.api.auth.expiredToken',
        status: 401,
        toString: function () {
            return "TYPE_API_AUTH_EXPIRED_TOKEN";
        }
    },
    TYPE_API_AUTH_INVALID_TOKEN: {
        msg: 'error.api.auth.invalidToken',
        status: 401,
        toString: function () {
            return "TYPE_API_AUTH_INVALID_TOKEN";
        }
    },
    TYPE_API_AUTH_NOT_REGISTER: {
        msg: 'error.api.auth.notRegister',
        status: 403,
        toString: function () {
            return "TYPE_API_AUTH_NOT_REGISTER";
        }
    },

    // Hospital
    TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND: {
        msg: 'error.api.hospital.notFound',
        status: 404,
        toString: function () {
            return "TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND";
        }
    },

    // User
    TYPE_API_USERID_NOT_FOUND: {
        msg: 'error.api.userId.notFound',
        status: 404,
        toString: function () {
            return "TYPE_API_USERID_NOT_FOUND";
        }
    },
    TYPE_API_USER_NOT_FOUND: {
        msg: 'error.api.user.notFound',
        status: 404,
        toString: function () {
            return "TYPE_API_USER_NOT_FOUND";
        }
    },
    TYPE_API_USER_INVALID_VERIFY_CODE: {
        msg: 'error.api.user.invalidVerifyCode',
        status: 400,
        toString: function () {
            return "TYPE_API_USER_INVALID_VERIFY_CODE";
        }
    },
    TYPE_API_USER_INVALID_ROLE: {
        msg: 'error.api.user.invalidRole',
        status: 400,
        toString: function () {
            return "TYPE_API_USER_INVALID_ROLE";
        }
    },
    TYPE_API_USER_DUPLICATED_PHONE_NUMBER: {
        msg: 'error.api.user.duplicatedPhoneNumber',
        status: 409,
        toString: function () {
            return "TYPE_API_USER_DUPLICATED_PHONE_NUMBER";
        }
    },
    TYPE_API_USER_DUPLICATED_OPEN_ID: {
        msg: 'error.api.user.duplicatedOpenId',
        status: 409,
        toString: function () {
            return "TYPE_API_USER_DUPLICATED_OPEN_ID";
        }
    },
    TYPE_API_VERIFY_CODE_INVALID_PHONE_NUMBER: {
        msg: 'error.api.verifyCode.invalidPhoneNumber',
        status: 400,
        toString: function () {
            return "TYPE_API_VERIFY_CODE_INVALID_PHONE_NUMBER";
        }
    },
    TYPE_API_USER_PWD_INVALID: {
        msg: 'error.api.user.pwdInvalid',
        status: 401,
        toString: function () {
            return "TYPE_API_USER_PWD_INVALID";
        }
    },

    // Price
    TYPE_API_PRICE_NOT_FOUND: {
        msg: 'error.api.price.notFound',
        status: 404,
        toString: function () {
            return "TYPE_API_PRICE_NOT_FOUND";
        }
    },

    // Work
    TYPE_API_WORK_NOT_FOUND: {
        msg: 'error.api.work.notFound',
        status: 404,
        toString: function () {
            return "TYPE_API_WORK_NOT_FOUND";
        }
    },
    TYPE_API_WORK_CONFLICT: {
        msg: 'error.api.work.conflict',
        status: 409,
        toString: function () {
            return "TYPE_API_WORK_CONFLICT";
        }
    },
    TYPE_API_WORK_NOT_APPROVED: {
        msg: 'error.api.work.notApproved',
        status: 403,
        toString: function () {
            return "TYPE_API_WORK_NOT_APPROVED";
        }
    },
    TYPE_API_WORK_PAYMENT_METHOD_NOT_FOUND: {
        msg: 'error.api.work.paymentMethod.notFound',
        status: 404,
        toString: function () {
            return "TYPE_API_WORK_PAYMENT_METHOD_NOT_FOUND";
        }
    },
    TYPE_API_WORK_SERVICE_NOT_FOUND: {
        msg: 'error.api.work.service.notFound',
        status: 404,
        toString: function () {
            return "TYPE_API_WORK_SERVICE_NOT_FOUND";
        }
    },
    TYPE_API_WORK_SERVICE_CONFLICT: {
        msg: 'error.api.work.service.conflict',
        status: 409,
        toString: function () {
            return "TYPE_API_WORK_SERVICE_CONFLICT";
        }
    },
    TYPE_API_WORK_SERVICE_INVALID: {
        msg: 'error.api.work.service.invalid',
        status: 400,
        toString: function () {
            return "TYPE_API_WORK_SERVICE_INVALID";
        }
    },
    TYPE_API_WORK_NULL_STATE: {
        msg: 'error.api.hospital.noState',
        status: 400,
        toString: function () {
            return "TYPE_API_WORK_NULL_STATE";
        }
    },
    TYPE_API_WORK_NULL_CITY: {
        msg: 'error.api.work.noCity',
        status: 400,
        toString: function () {
            return "TYPE_API_WORK_NULL_CITY";
        }
    },
    TYPE_API_WORK_NOT_SUPPORT_CITY: {
        msg: 'error.api.work.notSupportCity',
        status: 400,
        toString: function () {
            return "TYPE_API_WORK_NOT_SUPPORT_CITY";
        }
    },
    TYPE_API_WORK_NULL_USER_ID: {
        msg: 'error.api.work.noUserId',
        status: 400,
        toString: function () {
            return "TYPE_API_WORK_NULL_USER_ID";
        }
    },

    // Supervision
    TYPE_API_SUPERVISION_NOT_FOUND: {
        msg: 'error.api.supervision.notFound',
        status: 404,
        toString: function () {
            return "TYPE_API_SUPERVISION_NOT_FOUND";
        }
    },
    TYPE_API_SUPERVISION_CONFLICT: {
        msg: 'error.api.supervision.conflict',
        status: 409,
        toString: function () {
            return "TYPE_API_SUPERVISION_CONFLICT";
        }
    },

    // OrderWork
    TYPE_API_ORDER_WORK_NO_PERMISSION: {
        msg: 'error.api.work.noPermission',
        status: 403,
        toString: function () {
            return "TYPE_API_ORDER_WORK_NO_PERMISSION";
        }
    },
    TYPE_API_ORDER_WORK_INVALID_STATUS: {
        msg: 'error.api.orderWork.invalidStatus',
        status: 400,
        toString: function () {
            return "TYPE_API_ORDER_WORK_INVALID_STATUS";
        }
    },
    TYPE_API_ORDER_WORK_NOT_FOUND: {
        msg: 'error.api.orderWork.notFound',
        status: 404,
        toString: function () {
            return "TYPE_API_ORDER_WORK_NOT_FOUND";
        }
    },
    TYPE_API_ORDER_WORK_NOT_IDLE: {
        msg: 'error.api.orderWork.notIdle',
        status: 400,
        toString: function () {
            return "TYPE_API_ORDER_WORK_NOT_IDLE";
        }
    },

    // Order
    TYPE_API_ORDER_NOT_FOUND: {
        msg: 'error.api.order.notFound',
        status: 404,
        toString: function () {
            return "TYPE_API_ORDER_NOT_FOUND";
        }
    },
    TYPE_API_ORDER_INVALID_STATUS: {
        msg: 'error.api.order.invalidStatus',
        status: 400,
        toString: function () {
            return "TYPE_API_ORDER_INVALID_STATUS";
        }
    },
    TYPE_API_ORDER_REFUND_INVALID_AMOUNT: {
        msg: 'error.api.order.refund.invalidAmount',
        status: 400,
        toString: function () {
            return "TYPE_API_ORDER_REFUND_INVALID_AMOUNT";
        }
    },
    TYPE_API_ORDER_NO_PERMISSION: {
        msg: 'error.api.order.noPermission',
        status: 403,
        toString: function () {
            return "TYPE_API_ORDER_NO_PERMISSION";
        }
    },
    TYPE_API_ORDER_NOT_COMPLETE: {
        msg: 'error.api.order.notComplete',
        status: 404,
        toString: function () {
            return "TYPE_API_ORDER_NOT_COMPLETE";
        }
    },
    TYPE_API_ORDER_COMPLETED: {
        msg: 'error.api.order.completed',
        status: 400,
        toString: function () {
            return "TYPE_API_ORDER_COMPLETED";
        }
    },
    TYPE_API_ORDER_PAID: {
        msg: 'error.api.order.paid',
        status: 400,
        toString: function () {
            return "TYPE_API_ORDER_PAID";
        }
    },
    TYPE_API_ORDER_CREATE_WECHAT_PAY_FAIL: {
        msg: 'error.api.order.createWechatPayFail',
        status: 400,
        toString: function () {
            return "TYPE_API_ORDER_CREATE_WECHAT_PAY_FAIL";
        }
    },
    TYPE_API_ORDER_NO_AVAILABLE_WORKER: {
        msg: 'error.api.order.noAvailableWorker',
        status: 400,
        toString: function () {
            return "TYPE_API_ORDER_NO_AVAILABLE_WORKER";
        }
    },
    TYPE_API_ORDER_RATING_NOT_FOUND: {
        msg: 'error.api.order.rating.notFound',
        status: 404,
        toString: function () {
            return "TYPE_API_ORDER_RATING_NOT_FOUND";
        }
    },
    TYPE_API_ORDER_RATING_CONFLICT: {
        msg: 'error.api.order.rating.conflict',
        status: 409,
        toString: function () {
            return "TYPE_API_ORDER_RATING_CONFLICT";
        }
    },
    TYPE_API_ORDER_REFUND_INVALID_STATUS: {
        msg: 'error.api.order.refund.invalidStatus',
        status: 400,
        toString: function () {
            return "TYPE_API_ORDER_REFUND_INVALID_STATUS";
        }
    },
    //redis lock error
    TYPE_API_REDIS_KEY_LOCKED: {
        msg: 'error.api.redis.key.locked',
        status: 423,
        toString: function () {
            return "TYPE_API_REDIS_KEY_LOCKED";
        }
    }
};

exports.types = types;
exports.newError = newError;
exports.wrapError = wrapError;
exports.BaseError = BaseError;
