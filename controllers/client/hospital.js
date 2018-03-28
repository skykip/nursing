
"use strict";
const co = require('co');
const _ = require('lodash');
const errors = require('../../errors');
//const User = require('../../models').user;
const Hospital = require('../../models').hospital;
const moment = require('moment');

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
                    pagination:{page:1,limit:1000}
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

//获取所有医院信息--post
const getHospitalspost = function (req, res, next) {
    let queryUtils = require('../../utils/queryUtils');
    //let ids = queryUtils.parseQueryIds(req.query.hospitalId);
    let states = queryUtils.parseQueryStrings(req.body.state);
    let cities = queryUtils.parseQueryStrings(req.body.city);
    let regions = queryUtils.parseQueryStrings(req.body.region);
    //console.log(ids);
    console.log(states);
    console.log(cities);
    console.log(regions);
    
    if(req.body.page==null){
        req.body.page=1;
    };
    if(req.body.limit==null){
        req.body.limit=1000
    };

    let options = {
        query: {},
        pagination:
        {
            page:queryUtils.parseQueryIds(req.body.page),
            limit:queryUtils.parseQueryIds(req.body.limit)
        }
    };
    console.log(options);
    //options.query.ids = ids;
    options.query.states = states;
    options.query.cities = cities;
    options.query.regions = regions;

    co(function*() {
        let hospitals = yield Hospital.queryAll(options);
        //console.log(hospitals);
        if(hospitals){
            // let newhospitals={
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
                    pagination:{page:1,limit:1000}
                };
                let pages = yield Hospital.queryAll(page);
                totalPages = pages.length / +options.pagination.limit;
                totalPages = (totalPages > 1)
                    ? Math.ceil(+totalPages)
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
                    ? Math.ceil(+totalPages)
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


//通过医院id获取医院信息
function findHospital(req, res, next) {
    console.log("getHospitalsId first");
    let hospitalId = req.params.hospitalId;
    console.log(hospitalId);
    var reg = /[0-9]+/;   
    if(reg.test(hospitalId)){
    co(function*() {
        let hospital = yield Hospital.queryById(hospitalId);
        if (hospital) {
            // let returnhospital = {
            //     state:1,
            //     msg:"查询成功",
            //     pub:hospital
            // }
            req.hospital = hospital;
            return next();
        } else {
            let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
            return next(error);
        }
    }).catch(function (err) {
        return next(err);
    });
    }else{
        let hospital = {
            state:0,
            msg:"请检查id格式",
            pub:""
        }
        req.hospital = hospital;
        return next();
    }
}
const getHospitalsId = function (req, res, next) {
    console.log("getHospitalsId second");
    let hospital = req.hospital;
    return res.jsonp(hospital);
};

//通过医院所在省份获取医院信息
// function findHospitalbyState(req, res, next) {
//     console.log("getHospitalsState first");
//     let hospitalState = req.params.state;
//     co(function*() {
//         let hospital = yield Hospital.queryByState(hospitalState);
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
// const getHospitalsState = function (req, res, next) {
//     console.log("getHospitalsState second");
//     let hospital = req.hospital;
//     return res.jsonp(hospital);
// };

//通过医院所在省市区获取医院信息
// function findHospitalbyStateCityRegion(req, res, next) {
//     console.log("getHospitalsStateCityRegion first");
//     let hospitalState = req.params.state;
//     console.log(hospitalState);
//     let hospitalCity = req.params.city;
//     let hospitalRegion = req.params.region;
//     co(function*() {
//         let hospital = yield Hospital.queryByStateCityRegion(hospitalState,hospitalCity,hospitalRegion);
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
// const getHospitalsStateCityRegion = function (req, res, next) {
//     console.log("getHospitalsStateCityRegion second");
//     let hospital = req.hospital;
//     return res.jsonp(hospital);
// };


// const getHospitalsId = function (req, res, next) {
//     // let queryUtils = require('../../utils/queryUtils');
//     // let id = queryUtils.parseQueryIds(req.query.id);
//     let id = req.params.hospitalId;
//     co(function*() {
//         let hospitals = yield Hospital.queryById(id);
//         return res.jsonp(hospitals);
//     }).catch(function (err) {
//         return next(err);
//     });

//     // let hospital = req.hospital;
//     // return res.jsonp(hospital);
// };

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

//put通过id更新医院
const findUpdateHospital = function(req, res, next) {
    let hospitalId = req.params.hospitalId;
    Hospital.queryById(hospitalId).then(function (hospital) {
        if (!hospital) {
            let error = errors.newError(errors.types.TYPE_API_USER_NOT_FOUND);
            return next(error);
        }
        req.targetHospital = hospital;
        next();
    });
};
const putUpdateHospital = function name(req, res, next) {
    let values = _.pickBy(req.body, _.identity);
    req.targetHospital.update(values).then(function (test) {
        let returnvalues = {
            state:0,
            msg:"更新成功",
            data:values
        };
        return res.jsonp(returnvalues);
    }).catch(function (err) {
        console.log(err);
        next(err);
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

//获取市区下属所有医院名字--get
const getHospitalsNameget = function (req, res, next) {
    let queryUtils = require('../../utils/queryUtils');
    //let ids = queryUtils.parseQueryIds(req.query.hospitalId);
    let states = queryUtils.parseQueryStrings(req.query.state);
    let cities = queryUtils.parseQueryStrings(req.query.city);
    let regions = queryUtils.parseQueryStrings(req.query.region);
   
    console.log(states);
    console.log(cities);
    console.log(regions);
 
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
        let hospitals = yield Hospital.queryAllHospitalName(options);
        if(hospitals){
            // let retunrnhospitals={
            //     state:1,
            //     msg:"查询成功",
            //     pub:hospitals
            // };
            return res.jsonp(hospitals);
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

//获取对应省份、市下属的所有区的医院--get1
// const getHospitalsRegionget = function (req, res, next) {
//     let queryUtils = require('../../utils/queryUtils');

//     let states = queryUtils.parseQueryStrings(req.query.state);
//     let cities = queryUtils.parseQueryStrings(req.query.city);
//    // let regions = queryUtils.parseQueryStrings(req.query.region);
   
//     let options = {
//         query: {},
//         pagination:req.pagination
        
//     };
//     console.log(req.pagination);
//     options.query.states = states;
//     options.query.cities = cities;
//     //options.query.regions = regions;
//     console.log(options);
    
//     co(function*() {
//         let hospitals = yield Hospital.queryAllHospitalRegion(options);
//         if(hospitals){
           
//             //region+hospitalname拼接格式
//             let returnHospital={
//                 list:[]
//             }
            
//             //取出regionarray
//             var regionArray=new Array()
//             hospitals.forEach(function(item,index){  
//                 regionArray.push(item.dataValues.region);
//             });
//             //去重
//             let uniqueRegionArray = unique(regionArray);
                
//             //通过去重后的region进行遍历
//                 for(let i = 0;i < uniqueRegionArray.length;i++){
//                     //模型
//                     let hospitalmodel = {
//                         region:{},
//                         name:[]
//                     };
//                     //遍历每一个取到的医院实体进行区域选择
//                     hospitals.forEach(function(item,index){ 
//                         let hospitals = item.dataValues;
//                         if(hospitals.region===uniqueRegionArray[i]){
//                             hospitalmodel.region=hospitals.region;
//                             hospitalmodel.name.push(hospitals.name);
//                         };
//                      }); 
//                      returnHospital.list.push(hospitalmodel);
//                 }
//                 //去掉json初始化时候的[0]元素
//                // returnHospital.list.splice(0,1);
//                // delete returnHospital.list[0];

//             let retunrnhospitals={
//                 state:1,
//                 msg:"查询成功",
//                 pub:returnHospital
//             };
//             return res.jsonp(retunrnhospitals);
//         }else{
//             let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
//             return next(error);
//         }
//     }).catch(function (err) {
//         return next(err);
//     });
// };

//获取对应省份、市下属的所有区的医院--get2
// const getHospitalsRegionget = function (req, res, next) {
//     let queryUtils = require('../../utils/queryUtils');

//     let states = queryUtils.parseQueryStrings(req.query.state);
//     let cities = queryUtils.parseQueryStrings(req.query.city);
//    // let regions = queryUtils.parseQueryStrings(req.query.region);
   
//     let options = {
//         query: {},
//         pagination:req.pagination
        
//     };
//     console.log(req.pagination);
//     options.query.states = states;
//     options.query.cities = cities;
//     //options.query.regions = regions;
//     console.log(options);
    
//     co(function*() {
//         let hospitals = yield Hospital.queryAllHospitalRegion(options);
//         if(hospitals){
           
//             let obj = {};
//             hospitals.forEach(function(item,index){ 
//                 let a = item.dataValues;
//                 if(!obj.hasOwnProperty(a.region)){
//                     obj[a.region] = [];
//                     console.log(obj[a.region]);
//                 }
//             obj[a.region].push(a.name);
//             console.log(obj[a.region]);
//             });
//             // //region+hospitalname拼接格式
//             // let returnHospital={
//             //     list:[{region:{},name:[]}]
//             // }
            
//             // //取出regionarray
//             // var regionArray=new Array()
//             // hospitals.forEach(function(item,index){  
//             //     regionArray.push(item.dataValues.region);
//             // });
//             // //去重
//             // let uniqueRegionArray = unique(regionArray);
                
//             // //通过去重后的region进行遍历
//             //     for(let i = 0;i < uniqueRegionArray.length;i++){
//             //         //模型
//             //         let hospitalmodel = {
//             //             region:{},
//             //             name:[]
//             //         };
//             //         //遍历每一个取到的医院实体进行区域选择
//             //         hospitals.forEach(function(item,index){ 
//             //             let hospitals = item.dataValues;
//             //             if(hospitals.region===uniqueRegionArray[i]){
//             //                 hospitalmodel.region=hospitals.region;
//             //                 hospitalmodel.name.push(hospitals.name);
//             //             };
//             //          }); 
//             //          returnHospital.list.push(hospitalmodel);
//             //     }
//             //     //去掉json初始化时候的[0]元素
//             //     returnHospital.list.splice(0,1);
//             //    // delete returnHospital.list[0];

//             let retunrnhospitals={
//                 state:1,
//                 msg:"查询成功",
//                 pub:obj
//             };
//             return res.jsonp(retunrnhospitals);
//         }else{
//             let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
//             return next(error);
//         }
//     }).catch(function (err) {
//         return next(err);
//     });
// };

// //获取市--->区的医院信息--get3
// const getHospitalsRegionget = function (req, res, next) {
//     let queryUtils = require('../../utils/queryUtils');

//     let states = queryUtils.parseQueryStrings(req.query.state);
//     let cities = queryUtils.parseQueryStrings(req.query.city);
//     let regions = queryUtils.parseQueryStrings(req.query.region);
   
//     let options = {
//         query: {},
//         pagination:req.pagination
        
//     };
//     console.log(req.pagination);
//     options.query.states = states;
//     options.query.cities = cities;
//     options.query.regions = regions;
//     console.log(options);
    
//     co(function*() {
//         let hospitals = yield Hospital.queryAll(options);
//         if(hospitals){
           
//             //region+hospitalname拼接格式
//             // var returnHospital = {
//             //     list:[{state:{},city:[{region:{},name:[]}]}]
//             // }
//             // let returnHospital={
//             //     city:{},
//             //     regions:[]
//             // }
//             let returnHospital={
//                 list:[]
//             }
//             //取出stateArray、cityArray、regionArray
//             //var stateArray=new Array();
//             var cityArray=new Array();
//             var regionArray=new Array();
//             hospitals.forEach(function(item,index){  
//                 //stateArray.push(item.dataValues.state);
//                 cityArray.push(item.dataValues.city);
//                 regionArray.push(item.dataValues.region);
//             });
//             //去重
//             //let uniqueStateArray = unique(stateArray);
//             let uniqueCityArray = unique(cityArray);
//             let uniqueRegionArray = unique(regionArray);

                
//             //通过去重后的region进行遍历
//                 for(let i = 0;i < uniqueCityArray.length;i++){
//                     //模型
//                     let hospitalmodel1 = {city:{},regions:[]};
//                     //遍历每一个取到的医院实体进行区域选择
//                     let obj = {};
//                     hospitals.forEach(function(item,index){ 
//                         //let hospitalmode2 = {name:[]};
//                         let hospital = item.dataValues;
//                         if(hospital.city===uniqueCityArray[i]){
//                             hospitalmodel1.city = hospital.city;
                            
//                             if(!obj.hasOwnProperty(hospital.region)){
//                                 obj[hospital.region] = [];
//                                 console.log(obj[hospital.region]);}
//                             obj[hospital.region].push(hospital.name);
//                             console.log(obj[hospital.region]);
                            
//                         };
//                      }); 
//                      hospitalmodel1.regions.push(obj);
//                      //hospitalmodel1.regions.splice(0,1);
//                      returnHospital.list.push(hospitalmodel1);
//                 }
//                  //通过去重后的region进行遍历
//                 //  for(let i = 0;i < uniqueCityArray.length;i++){
//                 //     //模型
//                 //     let hospitalmodel1 = {};
//                 //     //遍历每一个取到的医院实体进行区域选择
//                 //     let obj = {};
//                 //     hospitals.forEach(function(item,index){ 
//                 //         //let hospitalmode2 = {name:[]};
//                 //         let hospital = item.dataValues;
//                 //         if(hospital.city===uniqueCityArray[i]){
//                 //             if(!hospitalmodel1.hasOwnProperty(hospital.city)){
//                 //                 hospitalmodel1.city=hospital.city;
//                 //                 hospitalmodel1["regions"] = [];
//                 //             }
//                 //             hospitalmodel1[hospital.city].push(hospital.city);
    
//                 //             if(!obj.hasOwnProperty(hospital.region)){
//                 //                 obj[hospital.region] = [];
//                 //                 }
//                 //             obj[hospital.region].push(hospital.name);
                          
//                 //         };
//                 //      }); 
//                 //      hospitalmodel1.regions.push(obj);
//                 //      //hospitalmodel1.regions.splice(0,1);
//                 //      returnHospital.list.push(hospitalmodel1);
//                 // }
                
                
//                 //returnHospital.list.splice(0,1);

//                 // returnHospital.list["regions"]=[];
//                 // returnHospital.list.regions["name"]=[];

//                 // for(let i = 0;i < uniqueCityArray.length;i++){



//                 //     hospitals.forEach(function(item,index){ 
//                 //         let hospital = item.dataValues;
//                 //         returnHospital.list.city = hospital.city;
//                 //         if(returnHospital.list.city===uniqueCityArray[i]){
//                 //          returnHospital.list.regions.region = hospital.region;
//                 //          for(let j = 0;j < uniqueRegionArray.length;j++){
//                 //              if(returnHospital.list.regions.region===uniqueRegionArray[j]){
//                 //                 returnHospital.list.regions.name.push(hospital.name);
//                 //              }
//                 //          }
//                 //         }

//                 //     });
//                 //     returnHospital.list.push(returnHospital.list);



//                 // }



//                 //去掉json初始化时候的[0]元素
//                // returnHospital.list.splice(0,1);
//                // delete returnHospital.list[0];

//             let retunrnhospitals={
//                 state:1,
//                 msg:"查询成功",
//                 pub:returnHospital
//             };
//             return res.jsonp(retunrnhospitals);
//         }else{
//             let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
//             return next(error);
//         }
//     }).catch(function (err) {
//         return next(err);
//     });
// };


//获取市--->区的医院信息--get4(key是数据)
// const getHospitalsRegionget = function (req, res, next) {
//     let queryUtils = require('../../utils/queryUtils');

//     let states = queryUtils.parseQueryStrings(req.query.state);
//     let cities = queryUtils.parseQueryStrings(req.query.city);
//     let regions = queryUtils.parseQueryStrings(req.query.region);
   
//     let options = {
//         query: {},
//         pagination:req.pagination
        
//     };
//     console.log(req.pagination);
//     options.query.states = states;
//     options.query.cities = cities;
//     options.query.regions = regions;
//     console.log(options);
    
//     co(function*() {
//         let hospitals = yield Hospital.queryAll(options);
//         if(hospitals){
           
//             //region+hospitalname拼接格式
//             let returnHospital={
//                 list:[]
//             }
//             //取出stateArray、cityArray、regionArray
//             //var stateArray=new Array();
//             var cityArray=new Array();
//             var regionArray=new Array();
//             hospitals.forEach(function(item,index){  
//                 //stateArray.push(item.dataValues.state);
//                 cityArray.push(item.dataValues.city);
//                 regionArray.push(item.dataValues.region);
//             });
//             //去重
//             //let uniqueStateArray = unique(stateArray);
//             let uniqueCityArray = unique(cityArray);
//             let uniqueRegionArray = unique(regionArray);

//                  //通过去重后的region进行遍历
//                  for(let i = 0;i < uniqueCityArray.length;i++){
//                     //模型
//                     let hospitalmodel1 = {};
//                     //遍历每一个取到的医院实体进行区域选择
//                     let obj = {};
//                     hospitals.forEach(function(item,index){ 
//                         //let hospitalmode2 = {name:[]};
//                         let hospital = item.dataValues;
//                         if(hospital.city===uniqueCityArray[i]){
//                             if(!hospitalmodel1.hasOwnProperty(hospital.city)){
//                                 hospitalmodel1[hospital.city] = [];
//                             }
//                             if(!obj.hasOwnProperty(hospital.region)){
//                                 obj[hospital.region] = [];
//                                 }
//                             obj[hospital.region].push(hospital.name);
//                         };
//                     });
//                     hospitalmodel1[uniqueCityArray[i]].push(obj);
                   
//                      returnHospital.list.push(hospitalmodel1);
//                 }
                
//             let retunrnhospitals={
//                 state:1,
//                 msg:"查询成功",
//                 pub:returnHospital
//             };
//             return res.jsonp(retunrnhospitals);
//         }else{
//             let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
//             return next(error);
//         }
//     }).catch(function (err) {
//         return next(err);
//     });
// };

//获取市--->区的医院信息--get5
const getHospitalsRegionget = function (req, res, next) {
    let queryUtils = require('../../utils/queryUtils');

    let states = queryUtils.parseQueryStrings(req.query.state);
    let cities = queryUtils.parseQueryStrings(req.query.city);
    let regions = queryUtils.parseQueryStrings(req.query.region);
    let areacode = queryUtils.parseQueryStrings(req.query.areacode);

    let options = {
        query: {},
        pagination:req.pagination
        
    };
    console.log(req.pagination);
    options.query.states = states;
    options.query.cities = cities;
    options.query.regions = regions;
    options.query.areacode = areacode;
    console.log(options);
    
    co(function*() {
        let hospitals = yield Hospital.queryAll(options);
        if(hospitals){
           
            //region+hospitalname拼接格式
            let returnHospital=[];
            //取出stateArray、cityArray、regionArray
            //var stateArray=new Array();
            var cityArray=new Array();
            var regionArray=new Array();
            hospitals.forEach(function(item,index){  
                //stateArray.push(item.dataValues.state);
                cityArray.push(item.dataValues.city);
                regionArray.push(item.dataValues.region);
            });
            //去重
            //let uniqueStateArray = unique(stateArray);
            let uniqueCityArray = unique(cityArray);
            let uniqueRegionArray = unique(regionArray);

                
            //通过去重后的region进行遍历
                for(let i = 0;i < uniqueCityArray.length;i++){
                    //模型
                    let hospitalmodel1 = {city:{},regions:[]};
                    for(let j = 0;j < uniqueRegionArray.length;j++){
                    //遍历每一个取到的医院实体进行区域选择
                    let obj = {region:{},name:[]};
                    hospitals.forEach(function(item,index){ 
                        //let hospitalmode2 = {name:[]};
                        let hospital = item.dataValues;
                        if(hospital.city===uniqueCityArray[i]){
                            hospitalmodel1.city = hospital.city;
                            // {
                                
                            //     // alphabet:hospital.alphabet
                            // }
                                if(hospital.region===uniqueRegionArray[j]){
                                    obj.region=hospital.region;
                                    let info = {
                                        hospital_id : hospital.id,
                                        hospital_name : hospital.name
                                    }
                                    obj.name.push(info);
                                }
                                };
                            }); 
                            //去除没查到数据时候的obj
                            if(obj.name.length!=0){
                                hospitalmodel1.regions.push(obj);
                            }
                        }
                        returnHospital.push(hospitalmodel1);
                }
                
                //去掉json初始化时候的[0]元素
               // returnHospital.list.splice(0,1);
               // delete returnHospital.list[0];

            // let retunrnhospitals={
            //     state:1,
            //     msg:"查询成功",
            //     pub:returnHospital
            // };
            return res.jsonp(returnHospital);
        }else{
            let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
            return next(error);
        }
    }).catch(function (err) {
        return next(err);
    });
};

//获取经纬度距离
const getHospitalsDistance = function (req, res, next) {
    let queryUtils = require('../../utils/queryUtils');
    let lng = queryUtils.parseQueryStrings(req.query.lng);
    let lat = queryUtils.parseQueryStrings(req.query.lat);
    // let options = {
    //     query: {},
    //     pagination:req.pagination
    // };
    co(function*() {
        let hospitalsLngLat = yield Hospital.queryAllHospitalLngLat();
        if(hospitalsLngLat){
            //读取计算距离的util
            let distanceUtil = require('../../utils/distanceUtil');
            //数据存储距离
            let distanceArray = [];
            //遍历所有经纬度，与位置信息进行距离计算
            hospitalsLngLat.forEach(function(item,index){
               let LngLat = item.dataValues;
               let distance = distanceUtil.getFlatternDistance(+lat[0],+lng[0],+LngLat.lat,+LngLat.lng);
               let distancejson = {
                   hospital_id :LngLat.id,
                   distance:distance
               };
               distanceArray.push(distancejson);
            });
            //读取排序的util
            var sort = require('../../utils/sort');
            //对距离数组进行排序
            var sortDistanceArray= sort.sortObj(distanceArray,'distance','asc');

            //通过第一的hospitalid查询医院信息
            let hospitalsinfo = yield Hospital.queryHospitalByIdlnglat(sortDistanceArray[0].hospital_id);

            return res.jsonp(hospitalsinfo);
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
            //没有省市区参数时的分页情况，查询所有数据进行总页数的添加
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
            //有省市区参数时的分页情况，查询该参数的所有数据进行总页数的添加
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
exports.getHospitalsget = [getHospitalsget];
exports.getHospitalspost = [getHospitalspost];
exports.getHospitalsId = [findHospital, getHospitalsId];
exports.postAddHospital=postAddHospital;
exports.deleteHospitalById = deleteHospitalById;
exports.putUpdateHospital = [findUpdateHospital,putUpdateHospital];
exports.patchUpdateHospital = patchUpdateHospital;
exports.getHospitalsNameget = getHospitalsNameget;
exports.getHospitalsStateget = getHospitalsStateget;
exports.getHospitalsCityget = getHospitalsCityget;
exports.getHospitalsRegionget = getHospitalsRegionget;
exports.getHospitalsDistance = getHospitalsDistance;
exports.getLikeSearchHospitalName = getLikeSearchHospitalName;
exports.getRegions= getRegions;


// exports.getHospitalsState = [findHospitalbyState,getHospitalsState];
// exports.getHospitalsStateCityRegion = [findHospitalbyStateCityRegion,getHospitalsStateCityRegion];