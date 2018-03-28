"use strict";
module.exports = function (sequelize, DataTypes) {
const Test = sequelize.define('test', {
      id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      firstName: {
          type: DataTypes.STRING,
          comment: '姓',
      },
      lastName: {
          type: DataTypes.STRING,
          comment: '名',
      }
  }, {
    comment: '测试表',
    engine: "InnoDB ROW_FORMAT = DYNAMIC",
    rowFormat: "DYNAMIC",
    createdAt: 'ctime',
    updatedAt: 'utime',
    deletedAt: 'dtime',
    paranoid: false
});
// 类方法
//查询
Test.queryById = function (id) {
  return Test.find({
      where: {
          id: id
      }
  });
};

//增加
Test.addTest = function (firstName,lastName) {
  return Test.create({
    firstName: firstName,
    lastName: lastName
  });
};
//修改
Test.updateTest = function (id,firstName,lastName) {
  return sequelize.transaction(function (t) {
    return Test.update({
        firstName: firstName,
        lastName: lastName
    },{
        where:{
            id:id
        },
        transaction: t
    }).then(function (result) {
        if (!result[0]) {
            throw new Error();
        }
        console.log('updated Test');
        console.log(result);
    });
  });
};
//删除
Test.deleteTest = function (testId) {
  return sequelize.transaction(function (t) {
      return Test.destroy({
          where: {
              id:testId
          },
          transaction: t
      }).then(function (records) {
          return "{'msg':'success'"+records+"}";
      });
  });
};


//实例方法
// Test.prototype.toJSON = function () {
//   let _ = require('lodash');
//   let values = this.dataValues;
//   let excludeValue = ['ctime', 'utime', 'dtime', 'firstName', 'lastName'];
//   values = _.omit(values, excludeValue);
//   return values;
// };

return Test;
};
