var Permissions = require('./adminPermissions');

var ROLE_CALL_CENTER = {
    name: "callCenter",
    permissions: [
        Permissions.ADMIN_USERS_READ,
        Permissions.ADMIN_USERS_LIST,

        Permissions.ADMIN_HOSPITALS_READ,
        Permissions.ADMIN_HOSPITALS_CREATE,
        Permissions.ADMIN_HOSPITALS_DELETE,
        Permissions.ADMIN_HOSPITALS_LIST,
        Permissions.ADMIN_HOSPITALS_UPDATE,

        Permissions.ADMIN_WORKS_READ,
        Permissions.ADMIN_WORKS_CREATE,
        Permissions.ADMIN_WORKS_LIST,
        Permissions.ADMIN_WORKS_UPDATE,
        Permissions.ADMIN_WORKS_REVIEW,

        Permissions.ADMIN_SUPERVISIONS_READ,
        Permissions.ADMIN_SUPERVISIONS_CREATE,
        Permissions.ADMIN_SUPERVISIONS_LIST,
        Permissions.ADMIN_SUPERVISIONS_UPDATE,
        Permissions.ADMIN_SUPERVISIONS_REVIEW,
        
        Permissions.ADMIN_ORDER_WORKS_READ ,
        Permissions.ADMIN_ORDER_WORKS_CREATE,
        Permissions.ADMIN_ORDER_WORKS_LIST,
        Permissions.ADMIN_ORDER_WORKS_UPDATE,
        Permissions.ADMIN_ORDER_WORKS_REVIEW,
        Permissions.ADMIN_ORDER_WORKS_DELETE,
        
        Permissions.ADMIN_ORDERS_READ,
        Permissions.ADMIN_ORDERS_CREATE,
        Permissions.ADMIN_ORDERS_DELETE,
        Permissions.ADMIN_ORDERS_LIST,
        Permissions.ADMIN_ORDERS_UPDATE,
        Permissions.ADMIN_ORDERS_REVIEW,

        Permissions.ADMIN_PRICES_READ,
        Permissions.ADMIN_PRICES_LIST,

        Permissions.ADMIN_STATISTICS_LIST,
        Permissions.ADMIN_STATISTICS_READ,

        Permissions.ADMIN_REVIEW_LOGS_CREATE,
        Permissions.ADMIN_REVIEW_LOGS_LIST
    ]
};

var ROLE_ACCOUNTANT = {
    name: "accountant",
    permissions: [
        Permissions.ADMIN_USERS_READ,
        Permissions.ADMIN_USERS_LIST,

        Permissions.ADMIN_HOSPITALS_READ,
        Permissions.ADMIN_HOSPITALS_LIST,

        Permissions.ADMIN_WORKS_READ,
        Permissions.ADMIN_WORKS_LIST,

        Permissions.ADMIN_SUPERVISIONS_READ,
        Permissions.ADMIN_SUPERVISIONS_LIST,

        Permissions.ADMIN_ORDERS_READ,
        Permissions.ADMIN_ORDERS_LIST,

        Permissions.ADMIN_SALARIES_READ,
        Permissions.ADMIN_SALARIES_LIST,
        Permissions.ADMIN_SALARIES_REVIEW,
    ]
};

var ROLE_ADMIN = {
    name: "admin",
    permissions: [
        Permissions.ADMIN_USERS_READ,
        Permissions.ADMIN_USERS_CREATE,
        Permissions.ADMIN_USERS_DELETE,
        Permissions.ADMIN_USERS_LIST,
        Permissions.ADMIN_USERS_UPDATE,
        
        Permissions.ADMIN_ROLES_READ,
        Permissions.ADMIN_ROLES_CREATE,
        Permissions.ADMIN_ROLES_DELETE,
        Permissions.ADMIN_ROLES_LIST,
        Permissions.ADMIN_ROLES_UPDATE,
        Permissions.ADMIN_ROLES_REVIEW,

        Permissions.ADMIN_ADMINS_READ,
        Permissions.ADMIN_ADMINS_CREATE,
        Permissions.ADMIN_ADMINS_DELETE,
        Permissions.ADMIN_ADMINS_LIST,
        Permissions.ADMIN_ADMINS_UPDATE,
        Permissions.ADMIN_ADMINS_REVIEW,

        Permissions.ADMIN_PERMISSIONS_READ,
        //Permissions.ADMIN_PERMISSIONS_CREATE,
        //Permissions.ADMIN_PERMISSIONS_DELETE,
        Permissions.ADMIN_PERMISSIONS_LIST,
        //Permissions.ADMIN_PERMISSIONS_UPDATE,
        //Permissions.ADMIN_PERMISSIONS_REVIEW,
        
        Permissions.ADMIN_HOSPITALS_READ,
        Permissions.ADMIN_HOSPITALS_CREATE,
        Permissions.ADMIN_HOSPITALS_DELETE,
        Permissions.ADMIN_HOSPITALS_LIST,
        Permissions.ADMIN_HOSPITALS_UPDATE,

        Permissions.ADMIN_WORKS_READ,
        Permissions.ADMIN_WORKS_CREATE,
        Permissions.ADMIN_WORKS_DELETE,
        Permissions.ADMIN_WORKS_LIST,
        Permissions.ADMIN_WORKS_UPDATE,
        Permissions.ADMIN_WORKS_REVIEW,
        
        Permissions.ADMIN_SUPERVISIONS_READ,
        Permissions.ADMIN_SUPERVISIONS_CREATE,
        Permissions.ADMIN_SUPERVISIONS_DELETE,
        Permissions.ADMIN_SUPERVISIONS_LIST,
        Permissions.ADMIN_SUPERVISIONS_UPDATE,
        Permissions.ADMIN_SUPERVISIONS_REVIEW,
        
        Permissions.ADMIN_ORDERS_READ,
        Permissions.ADMIN_ORDERS_CREATE,
        Permissions.ADMIN_ORDERS_DELETE,
        Permissions.ADMIN_ORDERS_LIST,
        Permissions.ADMIN_ORDERS_UPDATE,
        Permissions.ADMIN_ORDERS_REVIEW,

        Permissions.ADMIN_ORDER_WORKS_READ ,
        Permissions.ADMIN_ORDER_WORKS_CREATE,
        Permissions.ADMIN_ORDER_WORKS_DELETE,
        Permissions.ADMIN_ORDER_WORKS_LIST,
        Permissions.ADMIN_ORDER_WORKS_UPDATE,
        Permissions.ADMIN_ORDER_WORKS_REVIEW,

        Permissions.ADMIN_STATISTICS_READ,
        Permissions.ADMIN_STATISTICS_LIST,

        Permissions.ADMIN_SALARIES_READ,
        Permissions.ADMIN_SALARIES_LIST,
        Permissions.ADMIN_SALARIES_REVIEW,

        Permissions.ADMIN_OPTIONS_READ,
        Permissions.ADMIN_OPTIONS_CREATE,
        Permissions.ADMIN_OPTIONS_UPDATE,

        Permissions.ADMIN_PRICES_READ,
        Permissions.ADMIN_PRICES_LIST,
        Permissions.ADMIN_PRICES_UPDATE,
        Permissions.ADMIN_PRICES_CREATE,

        Permissions.ADMIN_ORDER_STATUSES_LIST,
        Permissions.ADMIN_ORDER_STATUSES_READ,
        Permissions.ADMIN_ORDER_STATUSES_CREATE,

        Permissions.ADMIN_REVIEW_LOGS_CREATE,
        Permissions.ADMIN_REVIEW_LOGS_LIST
    ]
};

var roles = [
    ROLE_ADMIN,
    ROLE_CALL_CENTER,
    ROLE_ACCOUNTANT
];

exports.ROLE_ADMIN = ROLE_ADMIN;
exports.ROLE_CALL_CENTER = ROLE_CALL_CENTER;
exports.ROLE_ACCOUNTANT = ROLE_ACCOUNTANT;
exports.roles = roles;