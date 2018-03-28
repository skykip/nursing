/** User **/
exports.ADMIN_USERS_READ = 'admin:users:read';
exports.ADMIN_USERS_CREATE = 'admin:users:create';
exports.ADMIN_USERS_DELETE = 'admin:users:delete';
exports.ADMIN_USERS_LIST = 'admin:users:list';
exports.ADMIN_USERS_UPDATE = 'admin:users:update';

/** Admin **/
exports.ADMIN_ADMINS_READ = 'admin:admins:read';
exports.ADMIN_ADMINS_CREATE = 'admin:admins:create';
exports.ADMIN_ADMINS_DELETE = 'admin:admins:delete';
exports.ADMIN_ADMINS_LIST = 'admin:admins:list';
exports.ADMIN_ADMINS_UPDATE = 'admin:admins:update';
exports.ADMIN_ADMINS_REVIEW = 'admin:admins:review';

/** Role **/
exports.ADMIN_ROLES_READ = 'admin:roles:read';
exports.ADMIN_ROLES_CREATE = 'admin:roles:create';
exports.ADMIN_ROLES_DELETE = 'admin:roles:delete';
exports.ADMIN_ROLES_LIST = 'admin:roles:list';
exports.ADMIN_ROLES_UPDATE = 'admin:roles:update';
exports.ADMIN_ROLES_REVIEW = 'admin:roles:review';

/** Permissions **/
exports.ADMIN_PERMISSIONS_READ = 'admin:permissions:read';
exports.ADMIN_PERMISSIONS_CREATE = 'admin:permissions:create';
exports.ADMIN_PERMISSIONS_DELETE = 'admin:permissions:delete';
exports.ADMIN_PERMISSIONS_LIST = 'admin:permissions:list';
exports.ADMIN_PERMISSIONS_UPDATE = 'admin:permissions:update';
exports.ADMIN_PERMISSIONS_REVIEW = 'admin:permissions:review';

/** Hospital **/
exports.ADMIN_HOSPITALS_READ = 'admin:hospitals:read';
exports.ADMIN_HOSPITALS_CREATE = 'admin:hospitals:create';
exports.ADMIN_HOSPITALS_DELETE = 'admin:hospitals:delete';
exports.ADMIN_HOSPITALS_LIST = 'admin:hospitals:list';
exports.ADMIN_HOSPITALS_UPDATE = 'admin:hospitals:update';

/** Work **/
exports.ADMIN_WORKS_READ = 'admin:works:read';
exports.ADMIN_WORKS_CREATE = 'admin:works:create';
exports.ADMIN_WORKS_DELETE = 'admin:works:delete';
exports.ADMIN_WORKS_LIST = 'admin:works:list';
exports.ADMIN_WORKS_UPDATE = 'admin:works:update';
exports.ADMIN_WORKS_REVIEW = 'admin:works:review';

/** Supervision **/
exports.ADMIN_SUPERVISIONS_READ = 'admin:supervisions:read';
exports.ADMIN_SUPERVISIONS_CREATE = 'admin:supervisions:create';
exports.ADMIN_SUPERVISIONS_DELETE = 'admin:supervisions:delete';
exports.ADMIN_SUPERVISIONS_LIST = 'admin:supervisions:list';
exports.ADMIN_SUPERVISIONS_UPDATE = 'admin:supervisions:update';
exports.ADMIN_SUPERVISIONS_REVIEW = 'admin:supervisions:review';

/** Order **/
exports.ADMIN_ORDERS_READ = 'admin:orders:read';
exports.ADMIN_ORDERS_CREATE = 'admin:orders:create';
exports.ADMIN_ORDERS_DELETE = 'admin:orders:delete';
exports.ADMIN_ORDERS_LIST = 'admin:orders:list';
exports.ADMIN_ORDERS_UPDATE = 'admin:orders:update';
exports.ADMIN_ORDERS_REVIEW = 'admin:orders:review';

/** Order Work **/
exports.ADMIN_ORDER_WORKS_READ = 'admin:orderWorks:read';
exports.ADMIN_ORDER_WORKS_CREATE = 'admin:orderWorks:create';
exports.ADMIN_ORDER_WORKS_DELETE = 'admin:orderWorks:delete';
exports.ADMIN_ORDER_WORKS_LIST = 'admin:orderWorks:list';
exports.ADMIN_ORDER_WORKS_UPDATE = 'admin:orderWorks:update';
exports.ADMIN_ORDER_WORKS_REVIEW = 'admin:orderWorks:review';

/** Statistic **/
exports.ADMIN_STATISTICS_READ = 'admin:statistics:read';
exports.ADMIN_STATISTICS_LIST = 'admin:statistics:list';

/** Salary **/
exports.ADMIN_SALARIES_READ = 'admin:salaries:read';
exports.ADMIN_SALARIES_LIST = 'admin:salaries:list';
exports.ADMIN_SALARIES_REVIEW = 'admin:salaries:review';

/** Options **/
exports.ADMIN_OPTIONS_READ = 'admin:options:read';
exports.ADMIN_OPTIONS_CREATE = 'admin:options:create';
exports.ADMIN_OPTIONS_UPDATE = 'admin:options:update';

/** Price **/
exports.ADMIN_PRICES_READ = 'admin:prices:read';
exports.ADMIN_PRICES_LIST = 'admin:prices:list';
exports.ADMIN_PRICES_UPDATE = 'admin:prices:update';
exports.ADMIN_PRICES_CREATE = 'admin:prices:create';

/** Order Status **/
exports.ADMIN_ORDER_STATUSES_LIST = 'admin:orderStatuses:list';
exports.ADMIN_ORDER_STATUSES_READ = 'admin:orderStatuses:read';
exports.ADMIN_ORDER_STATUSES_CREATE = 'admin:orderStatuses:create';

/** Review Logs**/
exports.ADMIN_REVIEW_LOGS_LIST = 'admin:reviewLogs:list';
exports.ADMIN_REVIEW_LOGS_CREATE = 'admin:reviewLogs:create';


exports.permissionsNotAssignable = [
    //exports.ADMIN_PERMISSIONS_READ,
    exports.ADMIN_PERMISSIONS_CREATE,
    exports.ADMIN_PERMISSIONS_DELETE,
    //exports.ADMIN_PERMISSIONS_LIST,
    exports.ADMIN_PERMISSIONS_UPDATE,
    exports.ADMIN_PERMISSIONS_REVIEW,

    //exports.ADMIN_ROLES_READ,
    exports.ADMIN_ROLES_CREATE,
    exports.ADMIN_ROLES_DELETE,
    //exports.ADMIN_ROLES_LIST,
    exports.ADMIN_ROLES_UPDATE,
    exports.ADMIN_ROLES_REVIEW,

    //exports.ADMIN_ADMINS_READ,
    exports.ADMIN_ADMINS_CREATE,
    exports.ADMIN_ADMINS_DELETE,
    //exports.ADMIN_ADMINS_LIST,
    exports.ADMIN_ADMINS_UPDATE,
    exports.ADMIN_ADMINS_REVIEW
];

exports.permissions = [
    exports.ADMIN_USERS_READ,
    exports.ADMIN_USERS_CREATE,
    exports.ADMIN_USERS_DELETE,
    exports.ADMIN_USERS_LIST,
    exports.ADMIN_USERS_UPDATE,

    exports.ADMIN_PERMISSIONS_READ,
    exports.ADMIN_PERMISSIONS_CREATE,
    exports.ADMIN_PERMISSIONS_DELETE,
    exports.ADMIN_PERMISSIONS_LIST,
    exports.ADMIN_PERMISSIONS_UPDATE,
    exports.ADMIN_PERMISSIONS_REVIEW,

    exports.ADMIN_ROLES_READ,
    exports.ADMIN_ROLES_CREATE,
    exports.ADMIN_ROLES_DELETE,
    exports.ADMIN_ROLES_LIST,
    exports.ADMIN_ROLES_UPDATE,
    exports.ADMIN_ROLES_REVIEW,

    exports.ADMIN_ADMINS_READ,
    exports.ADMIN_ADMINS_CREATE,
    exports.ADMIN_ADMINS_DELETE,
    exports.ADMIN_ADMINS_LIST,
    exports.ADMIN_ADMINS_UPDATE,
    exports.ADMIN_ADMINS_REVIEW,

    exports.ADMIN_HOSPITALS_READ,
    exports.ADMIN_HOSPITALS_CREATE,
    exports.ADMIN_HOSPITALS_DELETE,
    exports.ADMIN_HOSPITALS_LIST,
    exports.ADMIN_HOSPITALS_UPDATE,

    exports.ADMIN_WORKS_READ,
    exports.ADMIN_WORKS_CREATE,
    exports.ADMIN_WORKS_DELETE,
    exports.ADMIN_WORKS_LIST,
    exports.ADMIN_WORKS_UPDATE,
    exports.ADMIN_WORKS_REVIEW,

    exports.ADMIN_SUPERVISIONS_READ,
    exports.ADMIN_SUPERVISIONS_CREATE,
    exports.ADMIN_SUPERVISIONS_DELETE,
    exports.ADMIN_SUPERVISIONS_LIST,
    exports.ADMIN_SUPERVISIONS_UPDATE,
    exports.ADMIN_SUPERVISIONS_REVIEW,

    exports.ADMIN_ORDERS_READ,
    exports.ADMIN_ORDERS_CREATE,
    exports.ADMIN_ORDERS_DELETE,
    exports.ADMIN_ORDERS_LIST,
    exports.ADMIN_ORDERS_UPDATE,
    exports.ADMIN_ORDERS_REVIEW,

    exports.ADMIN_ORDER_WORKS_READ,
    exports.ADMIN_ORDER_WORKS_CREATE,
    exports.ADMIN_ORDER_WORKS_DELETE,
    exports.ADMIN_ORDER_WORKS_LIST,
    exports.ADMIN_ORDER_WORKS_UPDATE,
    exports.ADMIN_ORDER_WORKS_REVIEW,

    exports.ADMIN_STATISTICS_READ,
    exports.ADMIN_STATISTICS_LIST,

    exports.ADMIN_SALARIES_READ,
    exports.ADMIN_SALARIES_LIST,
    exports.ADMIN_SALARIES_REVIEW,

    exports.ADMIN_OPTIONS_READ,
    exports.ADMIN_OPTIONS_CREATE,
    exports.ADMIN_OPTIONS_UPDATE,

    exports.ADMIN_PRICES_READ,
    exports.ADMIN_PRICES_LIST,
    exports.ADMIN_PRICES_UPDATE,
    exports.ADMIN_PRICES_CREATE,

    exports.ADMIN_ORDER_STATUSES_LIST,
    exports.ADMIN_ORDER_STATUSES_READ,
    exports.ADMIN_ORDER_STATUSES_CREATE,

    exports.ADMIN_REVIEW_LOGS_LIST,
    exports.ADMIN_REVIEW_LOGS_CREATE
];