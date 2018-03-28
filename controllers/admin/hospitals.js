"use strict";
const co = require('co');
const _ = require('lodash');
const Hospital = require('../../models').hospital;
const errors = require('../../errors');
const Permissions = require('../../setup/adminPermissions');

// const getHospitals = function (req, res, next) {
//     let queryUtils = require('../../utils/queryUtils');
//     let ids = queryUtils.parseQueryIds(req.query.id);
//     let states = queryUtils.parseQueryStrings(req.query.state);
//     let cities = queryUtils.parseQueryStrings(req.query.city);

//     let options = {
//         query: {},
//         pagination: req.pagination
//     };
//     options.query.ids = ids;
//     options.query.states = states;
//     options.query.cities = cities;

//     co(function*() {
//         let hospitals = yield Hospital.queryAll(options);
//         return res.jsonp(hospitals);
//     }).catch(function (err) {
//         return next(err);
//     });
// };

// const postHospitals = function (req, res, next) {
//     let name = req.body.name;
//     let tel = req.body.tel;
//     let state = req.body.state;
//     let city = req.body.city;
//     let region = req.body.region;
//     let level = req.body.level;
//     let longitude = req.body.longitude;
//     let latitude = req.body.latitude;

//     co(function*() {
//         let hospital = Hospital.build({
//             name: name,
//             tel: tel,
//             state: state,
//             city: city,
//             region: region,
//             level: level
//         });
//         hospital = yield hospital.save();
//         return res.jsonp(hospital.toJSON());
//     }).catch(function (err) {
//         return next(err);
//     });
// };

// function findHospital(req, res, next) {
//     let hospitalId = req.params.hospitalId;
//     co(function*() {
//         let hospital = yield Hospital.queryById(hospitalId);
//         if (hospital) {
//             req.hospital = hospital;
//             return next();
//         } else {
//             let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
//             return next(error);
//         }
//     }).catch(function (err) {
//         return next(err);
//     });
// }

// const getHospitalsId = function (req, res, next) {
//     let hospital = req.hospital;
//     return res.jsonp(hospital);
// };

// const patchHospitalsId = function (req, res, next) {
//     let hospital = req.hospital;

//     let name = req.body.name;
//     let tel = req.body.tel;
//     let state = req.body.state;
//     let city = req.body.city;
//     let region = req.body.region;
//     let longitude = req.body.longitude;
//     let latitude = req.body.latitude;
//     let level = req.body.level;

//     let options = {
//         name: name,
//         tel: tel,
//         state: state,
//         city: city,
//         region: region,
//         level: level
//     };

//     options = _.pickBy(options, function (value, key) {
//         return value !== undefined;
//     });

//     co(function *() {
//         yield hospital.update(options);
//         return res.jsonp(hospital.toJSON());
//     }).catch(function (err) {
//         return next(err);
//     });
// };

// const deleteHospitalsId = function (req, res, next) {
//     let hospital = req.hospital;
//     co(function*() {
//         yield hospital.destroy();
//         return res.jsonp(hospital.toJSON());
//     }).catch(function (err) {
//         return next(err);
//     });

// };
//####################################################################
const checkPermission = function (permissions) {
    return function (req, res, next) {
        permissions = [].concat(permissions || []);
        if (!permissions.length) {
            return next();
        }
        let admin = req.admin;
        co(function *() {
            let hasPermission = yield admin.hasPermission(permissions);
            if (hasPermission) {
                return next();
            }
            let error = errors.newError(errors.types.TYPE_API_FORBIDDEN);
            return next(error);
        }).catch(function (err) {
            return next(err);
        });
    };
};
//####################################################################
//获取所有医院信息--get
const getHospitalsget = function (req, res, next) {
    let queryUtils = require('../../utils/queryUtils');
    //let ids = queryUtils.parseQueryIds(req.query.hospitalId);
    let states = queryUtils.parseQueryStrings(req.query.state);
    let cities = queryUtils.parseQueryStrings(req.query.city);
    let regions = queryUtils.parseQueryStrings(req.query.region);
    //console.log(ids);
    console.log(states);
    console.log(cities);
    console.log(regions);
    console.log(req.pagination);
    // if(req.query.page==null){
    //     req.query.page=1;
    // };
    // if(req.query.limit==null){
    //     req.query.limit=1000
    // };

    let options = {
        query: {},
        pagination:req.pagination
        // {
        //     page:queryUtils.parseQueryIds(req.query.page),
        //     limit:queryUtils.parseQueryIds(req.query.limit)
        // }
    };
    //options.query.ids = ids;
    options.query.states = states;
    options.query.cities = cities;
    options.query.regions = regions;
    console.log(options);
    
    co(function*() {
        let hospitals = yield Hospital.queryAll(options);
        //console.log(hospitals);
        // let h = hospitals[0].dataValues;
        // let e = new Date();
        // var now = moment();
        // h.ctime = moment(h.ctime).format('LLLL');
        // let m = moment(h.ctime, "YYYYMMDD").fromNow();

        //promise回调函数的执行步骤
        // function sayhello() {
        //     return Promise.resolve('hello').then(function(hello) {
        //         console.log(hello);
        //     });
        // }
        // function helloworld() {
        //     sayhello();
        //     console.log('world');
        // }
        // helloworld();
        if(hospitals){
            // let retunrnhospitals={
            //     state:1,
            //     msg:"查询成功",
            //     pub:hospitals
            // };

            
            //获取总页数
            let totalPages;
            //没有省市区参数时的分页情况，查询所有数据进行总页数的添加
            if(states.length===0&&cities.length===0&&regions.length===0){
                let page = {
                    query: {},
                    pagination:{page:1,limit:10000}
                };
                let pages = yield Hospital.queryAll(page);
                totalPages = pages.length / +options.pagination.limit;
                totalPages = (totalPages > 1)
                    ? Math.ceil(+totalPages)//向上取整，有小数就加一
                    : 1;
            }
            //有省市区参数时的分页情况，查询该参数的所有数据进行总页数的添加
            if(states.length!==0||cities.length!==0||regions.length!==0){
                let page = {
                    query: {},
                    pagination:{page:1,limit:1000}
                };
                page.query.states = states;
                page.query.cities = cities;
                page.query.regions = regions;
                let pages = yield Hospital.queryAll(page);

                totalPages = pages.length / +options.pagination.limit;
                totalPages = (totalPages > 1)
                    ? Math.ceil(+totalPages)//向上取整，有小数就加一
                    : 1;
            }
            let retunrnhospitals={
                    totalPages:totalPages,
                    data:hospitals
            };

            return res.jsonp(retunrnhospitals);
        }else{
            let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
            return next(error);
        }
    }).catch(function (err) {
        return next(err);
    });
};
//获取所有省份--get
const getHospitalsStateget = function (req, res, next) {
    let queryUtils = require('../../utils/queryUtils');
    //let ids = queryUtils.parseQueryIds(req.query.hospitalId);
    let states = queryUtils.parseQueryStrings(req.query.state);
    let cities = queryUtils.parseQueryStrings(req.query.city);
    let regions = queryUtils.parseQueryStrings(req.query.region);
   
    let options = {
        query: {},
        pagination:req.pagination
        
    };
    console.log(req.pagination);
    options.query.states = states;
    options.query.cities = cities;
    options.query.regions = regions;
    console.log(options);
    
    co(function*() {
        let hospitals = yield Hospital.queryAllHospitalState(options);
        if(hospitals){
           //取出statearray
           //var stateArray=new Array();
           let stateArray = {state:[]};
           hospitals.forEach(function(item,index){  
              // stateArray.push(item.dataValues.state);
              stateArray.state.push(item.dataValues.state);
           });
           //去重
           stateArray.state = unique(stateArray.state);    

           stateArray.state.forEach(function(item,index){
            if(item===null){//去掉为空值的
                stateArray.state.splice(index,1);
            }
       });   
           //返回查询记录
            // let retunrnhospitals={
            //     state:1,
            //     msg:"查询成功",
            //     pub:stateArray
            // };
            return res.jsonp(stateArray);
        }else{
            let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
            return next(error);
        }
    }).catch(function (err) {
        return next(err);
    });
};

//获取对应省份的所有市--get
const getHospitalsCityget = function (req, res, next) {
    let queryUtils = require('../../utils/queryUtils');
    //let ids = queryUtils.parseQueryIds(req.query.hospitalId);
    let states = queryUtils.parseQueryStrings(req.query.state);
   // let cities = queryUtils.parseQueryStrings(req.query.city);
   // let regions = queryUtils.parseQueryStrings(req.query.region);
   
    let options = {
        query: {},
        pagination:req.pagination
        
    };
    console.log(req.pagination);
    options.query.states = states;
    //options.query.cities = cities;
    //options.query.regions = regions;
    console.log(options);
    
    co(function*() {
        let hospitals = yield Hospital.queryAllHospitalCity(options);
        if(hospitals){

           //取出cityarray
           //var cityArray=new Array();
           let cityArray = {city:[]};
           hospitals.forEach(function(item,index){  
              // cityArray.push(item.dataValues.city);
              cityArray.city.push(item.dataValues.city);
           });
           //去重
           cityArray.city = unique(cityArray.city);    
           cityArray.city.forEach(function(item,index){
            if(item===null){//去掉为空值的
                cityArray.city.splice(index,1);
            }
       });    
            // let retunrnhospitals={
            //     state:1,
            //     msg:"查询成功",
            //     pub:cityArray
            // };
            return res.jsonp(cityArray);
        }else{
            let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
            return next(error);
        }
    }).catch(function (err) {
        return next(err);
    });
};

//获取对应市下属所有区--get
const getRegions = function (req, res, next) {
    let queryUtils = require('../../utils/queryUtils');
    //let ids = queryUtils.parseQueryIds(req.query.hospitalId);
    //let states = queryUtils.parseQueryStrings(req.query.state);
    let cities = queryUtils.parseQueryStrings(req.query.city);
   // let regions = queryUtils.parseQueryStrings(req.query.region);
   
    let options = {
        query: {},
        pagination:req.pagination
        
    };
    options.query.cities = cities;
    //options.query.cities = cities;
    //options.query.regions = regions;

    co(function*() {
        let hospitals = yield Hospital.queryAllRegions(options);
        if(hospitals){

           //取出cityarray
           //var cityArray=new Array();
           let regionArray = {region:[]};
           hospitals.forEach(function(item,index){  
              // cityArray.push(item.dataValues.city);
              regionArray.region.push(item.dataValues.region);
           });
           //去重
           regionArray.region = unique(regionArray.region);   
           regionArray.region.forEach(function(item,index){
                if(item===null){//去掉为空值的
                    regionArray.region.splice(index,1);
                }
           });
            // let retunrnhospitals={
            //     state:1,
            //     msg:"查询成功",
            //     pub:cityArray
            // };
            return res.jsonp(regionArray);
        }else{
            let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
            return next(error);
        }
    }).catch(function (err) {
        return next(err);
    });
};
//通过医院名字模糊查找医院信息
const getLikeSearchHospitalName = function (req, res, next) {
    let queryUtils = require('../../utils/queryUtils');
    let hospitalName = queryUtils.parseQueryStrings(req.query.hospitalName);
    let options = {
        query: {},
        pagination:req.pagination
    };
    options.query.hospitalName = hospitalName;
    co(function*() {
        let hospitals = yield Hospital.queryLikeHospitalName(options);
        if(hospitals){
            //获取总页数相关操作
            let totalPages;
            //没有hospitalName参数时的分页情况，查询所有数据进行总页数的添加
            if(hospitalName.length===0){
                let page = {
                    query: {},
                    pagination:{page:1,limit:1000}
                };
                let pages = yield Hospital.queryAll(page);
                totalPages = pages.length / +options.pagination.limit;
                totalPages = (totalPages > 1)
                    ? Math.ceil(+totalPages)//向上取整，有小数则+1
                    : 1;
            }
            //有hospitalName参数时的分页情况，查询该参数的所有数据进行总页数的添加
            if(hospitalName.length!=0){
                let page = {
                    query: {},
                    pagination:{page:1,limit:1000}
                };
                page.query.hospitalName = hospitalName;
                let pages = yield Hospital.queryLikeHospitalName(page);

                totalPages = pages.length / +options.pagination.limit;
                totalPages = (totalPages > 1)
                    ? Math.ceil(+totalPages)//向上取整，有小数则+1
                    : 1;
            }
            let retunrnhospitals={
                    totalPages:totalPages,
                    data:hospitals
            };
            return res.jsonp(retunrnhospitals);
        }else{
            let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
            return next(error);
        }
    }).catch(function (err) {
        return next(err);
    });
};
//增加医院
const postAddHospital = function name(req, res, next) {
    let options = {};
    options.name = req.body.hospitalName;//not null
    options.tel = req.body.hospitalTel;
    options.state = req.body.hospitalState;
    options.city = req.body.hospitalCity;
    options.region = req.body.hospitalRegion;
    options.address = req.body.hospitalAddress;
    options.level = req.body.hospitalLevel;
    options.areacode = req.body.hospitalAreaCode;
    options.lng = req.body.hospitalLng;
    options.lat = req.body.hospitalLat;
    options.profession = req.body.hospitalProfession;
    options.guide = req.body.hospitalGuide;
    options.picture = req.body.hospitalPicture;

    if(options.name){
    co(function *() {
        let addHospital = yield Hospital.addHospital(options);
        let returnHospital = {
            state:0,
            mag:"插入成功",
            data:addHospital
        };
        return res.jsonp(returnHospital);
    }).catch(function (err) {
        return next(err);
    });
}else{
    let returnHospital = {
        state:1,
        mag:"请检查参数",
        data:""
    };
    return res.jsonp(returnHospital);
}
}

//通过id删除医院
const deleteHospitalById = function deleteHospitalById(req, res, next) {
    let hospitalId = req.params.hospitalId;
    co(function *() {
        let hospital = yield Hospital.deleteHospitalById(hospitalId);
        return res.jsonp(hospital);
    }).catch(function (err) {
        return next(err);
    });
}
//patch通过id部分更新医院信息
const patchUpdateHospital = function name(req, res, next) {
    let hospitalId = req.params.hospitalId;
    let options = {};
    options.name = req.body.hospitalName;//not null
    options.tel = req.body.hospitalTel;
    options.state = req.body.hospitalState;
    options.city = req.body.hospitalCity;
    options.region = req.body.hospitalRegion;
    options.address = req.body.hospitalAddress;
    options.level = req.body.hospitalLevel;
    options.areacode = req.body.hospitalAreaCode;
    options.lng = req.body.hospitalLng;
    options.lat = req.body.hospitalLat;
    options.profession = req.body.hospitalProfession;
    options.guide = req.body.hospitalGuide;
    options.picture = req.body.hospitalPicture;
    co(function *() {
        let hospital = yield Hospital.updateHospital(hospitalId,options);
        let returnhospital= {
            state:0,
            msg:"patch更新成功",
            data:hospital
        };
        return res.jsonp(returnhospital);
    }).catch(function (err) {
        return next(err);
    });
}

//去重
function unique(array){ 
    var n = []; //一个新的临时数组 
    //遍历当前数组 
    for(var i = 0; i < array.length; i++){ 
    //如果当前数组的第i已经保存进了临时数组，那么跳过， 
    //否则把当前项push到临时数组里面 
    if (n.indexOf(array[i]) == -1) n.push(array[i]); 
    } 
    return n; 
}
// exports.getHospitals = [checkPermission(Permissions.ADMIN_HOSPITALS_LIST), getHospitals];
// exports.postHospitals = [checkPermission(Permissions.ADMIN_HOSPITALS_CREATE), postHospitals];
// exports.patchHospitalsId = [checkPermission(Permissions.ADMIN_HOSPITALS_UPDATE), findHospital, patchHospitalsId];
// exports.deleteHospitalsId = [checkPermission(Permissions.ADMIN_HOSPITALS_DELETE), findHospital, deleteHospitalsId];
// exports.getHospitalsId = [checkPermission(Permissions.ADMIN_HOSPITALS_READ), findHospital, getHospitalsId];

exports.getHospitalsget = [checkPermission(Permissions.ADMIN_HOSPITALS_LIST),getHospitalsget];
exports.postAddHospital=[checkPermission(Permissions.ADMIN_HOSPITALS_CREATE),postAddHospital];
exports.deleteHospitalById = [checkPermission(Permissions.ADMIN_HOSPITALS_DELETE),deleteHospitalById];
exports.patchUpdateHospital = [checkPermission(Permissions.ADMIN_HOSPITALS_UPDATE),patchUpdateHospital];
exports.getHospitalsStateget = getHospitalsStateget;
exports.getHospitalsCityget = getHospitalsCityget;
exports.getRegions= getRegions;
exports.getLikeSearchHospitalName = [checkPermission(Permissions.ADMIN_HOSPITALS_LIST),getLikeSearchHospitalName];
