
"use strict";
const co = require('co');
const _ = require('lodash');
const errors = require('../../errors');
//const User = require('../../models').user;
const Area = require('../../models').area;
const moment = require('moment');

//获取所有地区信息--get
const getAreasget = function (req, res, next) {
    let queryUtils = require('../../utils/queryUtils');
    //let ids = queryUtils.parseQueryIds(req.query.areaId);
    // let states = queryUtils.parseQueryStrings(req.query.state);
    // let cities = queryUtils.parseQueryStrings(req.query.city);
    // let regions = queryUtils.parseQueryStrings(req.query.region);
    //console.log(ids);
    // console.log(states);
    // console.log(cities);
    // console.log(regions);
    console.log(req.pagination);
    // if(req.query.page==null){
    //     req.query.page=1;
    // };
    // if(req.query.limit==null){
    //     req.query.limit=1000
    // };

    let options = {
        query: {},
        pagination:
        // {
        //     page:queryUtils.parseQueryIds(req.query.page),
        //     limit:queryUtils.parseQueryIds(req.query.limit)
        // }
        req.pagination
        
    };
    //options.query.ids = ids;
    // options.query.states = states;
    // options.query.cities = cities;
    // options.query.regions = regions;
    console.log(options);
    
    co(function*() {
        let areas = yield Area.queryAll(options);
        //console.log(areas);
        // let h = areas[0].dataValues;
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
        if(areas){
            // let retunrnareas={
            //     state:1,
            //     msg:"查询成功",
            //     pub:areas
            // };
            return res.jsonp(areas);
        }else{
            let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
            return next(error);
        }
    }).catch(function (err) {
        return next(err);
    });
};

// //获取所有医院信息--post
// const getAreaspost = function (req, res, next) {
//     let queryUtils = require('../../utils/queryUtils');
//     //let ids = queryUtils.parseQueryIds(req.query.areaId);
//     let states = queryUtils.parseQueryStrings(req.body.state);
//     let cities = queryUtils.parseQueryStrings(req.body.city);
//     let regions = queryUtils.parseQueryStrings(req.body.region);
//     //console.log(ids);
//     console.log(states);
//     console.log(cities);
//     console.log(regions);
    
//     if(req.body.page==null){
//         req.body.page=1;
//     };
//     if(req.body.limit==null){
//         req.body.limit=1000
//     };

//     let options = {
//         query: {},
//         pagination:
//         {
//             page:queryUtils.parseQueryIds(req.body.page),
//             limit:queryUtils.parseQueryIds(req.body.limit)
//         }
//     };
//     console.log(options);
//     //options.query.ids = ids;
//     options.query.states = states;
//     options.query.cities = cities;
//     options.query.regions = regions;

//     co(function*() {
//         let areas = yield Area.queryAll(options);
//         //console.log(areas);
//         if(areas){
//             // let newareas={
//             //     state:1,
//             //     msg:"查询成功",
//             //     pub:areas
//             // };
//             return res.jsonp(areas);
//         }else{
//             let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
//             return next(error);
//         }
//     }).catch(function (err) {
//         return next(err);
//     });
// };


// //通过医院id获取医院信息
// function findArea(req, res, next) {
//     console.log("getAreasId first");
//     let areaId = req.params.areaId;
//     console.log(areaId);
//     var reg = /[0-9]+/;   
//     if(reg.test(areaId)){
//     co(function*() {
//         let area = yield Area.queryById(areaId);
//         if (area) {
//             let returnarea = {
//                 state:1,
//                 msg:"查询成功",
//                 pub:area
//             }
//             req.area = returnarea;
//             return next();
//         } else {
//             let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
//             return next(error);
//         }
//     }).catch(function (err) {
//         return next(err);
//     });
//     }else{
//         let area = {
//             state:0,
//             msg:"请检查id格式",
//             pub:""
//         }
//         req.area = area;
//         return next();
//     }
// }
// const getAreasId = function (req, res, next) {
//     console.log("getAreasId second");
//     let area = req.area;
//     return res.jsonp(area);
// };

// //通过医院所在省份获取医院信息
// // function findAreabyState(req, res, next) {
// //     console.log("getAreasState first");
// //     let areaState = req.params.state;
// //     co(function*() {
// //         let area = yield Area.queryByState(areaState);
// //         if (area) {
// //             req.area = area;
// //             return next();
// //         } else {
// //             let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
// //             return next(error);
// //         }
// //     }).catch(function (err) {
// //         return next(err);
// //     });
// // }
// // const getAreasState = function (req, res, next) {
// //     console.log("getAreasState second");
// //     let area = req.area;
// //     return res.jsonp(area);
// // };

// //通过医院所在省市区获取医院信息
// // function findAreabyStateCityRegion(req, res, next) {
// //     console.log("getAreasStateCityRegion first");
// //     let areaState = req.params.state;
// //     console.log(areaState);
// //     let areaCity = req.params.city;
// //     let areaRegion = req.params.region;
// //     co(function*() {
// //         let area = yield Area.queryByStateCityRegion(areaState,areaCity,areaRegion);
// //         if (area) {
// //             req.area = area;
// //             return next();
// //         } else {
// //             let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
// //             return next(error);
// //         }
// //     }).catch(function (err) {
// //         return next(err);
// //     });
// // }
// // const getAreasStateCityRegion = function (req, res, next) {
// //     console.log("getAreasStateCityRegion second");
// //     let area = req.area;
// //     return res.jsonp(area);
// // };


// // const getAreasId = function (req, res, next) {
// //     // let queryUtils = require('../../utils/queryUtils');
// //     // let id = queryUtils.parseQueryIds(req.query.id);
// //     let id = req.params.areaId;
// //     co(function*() {
// //         let areas = yield Area.queryById(id);
// //         return res.jsonp(areas);
// //     }).catch(function (err) {
// //         return next(err);
// //     });

// //     // let area = req.area;
// //     // return res.jsonp(area);
// // };

// //增加医院
// const postAddArea = function name(req, res, next) {
//     let areaName = req.body.areaName;//not null
//     let areaTel = req.body.areaTel;
//     let areaState = req.body.areaState;
//     let areaCity = req.body.areaCity;
//     let areaRegion = req.body.areaRegion;

//     if(areaName&&areaTel||areaState||areaCity||areaRegion){
//     co(function *() {
//         let addArea = yield Area.addArea(areaName,areaTel,areaState,areaCity,areaRegion);
//         let returnArea = {
//             state:0,
//             mag:"插入成功",
//             data:addArea
//         };
//         return res.jsonp(returnArea);
//     }).catch(function (err) {
//         return next(err);
//     });
// }else{
//     let returnArea = {
//         state:1,
//         mag:"请检查参数",
//         data:""
//     };
//     return res.jsonp(returnArea);
// }
// }

// //通过id删除医院
// const deleteAreaById = function deleteAreaById(req, res, next) {
//     let areaId = req.params.areaId;
//     co(function *() {
//         let area = yield Area.deleteAreaById(areaId);
//         return res.jsonp(area);
//     }).catch(function (err) {
//         return next(err);
//     });
// }

// //put通过id更新医院
// const findUpdateArea = function(req, res, next) {
//     let areaId = req.params.areaId;
//     Area.queryById(areaId).then(function (area) {
//         if (!area) {
//             let error = errors.newError(errors.types.TYPE_API_USER_NOT_FOUND);
//             return next(error);
//         }
//         req.targetArea = area;
//         next();
//     });
// };
// const putUpdateArea = function name(req, res, next) {
//     let values = _.pickBy(req.body, _.identity);
//     req.targetArea.update(values).then(function (test) {
//         let returnvalues = {
//             state:0,
//             msg:"更新成功",
//             data:values
//         };
//         return res.jsonp(returnvalues);
//     }).catch(function (err) {
//         console.log(err);
//         next(err);
//     });
// }

// //patch通过id部分更新医院信息
// const patchUpdateArea = function name(req, res, next) {
    
//         let areaId = req.params.areaId;
//         let areaName = req.body.areaName;
//         let areaState = req.body.areaState;
//         let areaCity = req.body.areaCity;
//         let areaRegion = req.body.areaRegion;

//         co(function *() {
//             let area = yield Area.updateArea(areaId,areaName,areaState,areaCity,areaRegion);
//             let returnarea= {
//                 state:0,
//                 msg:"patch更新成功",
//                 data:area
//             };
//             return res.jsonp(returnarea);
//         }).catch(function (err) {
//             return next(err);
//         });
//     }

// //获取所有医院信息--get
// const getAreasNameget = function (req, res, next) {
//     let queryUtils = require('../../utils/queryUtils');
//     //let ids = queryUtils.parseQueryIds(req.query.areaId);
//     let states = queryUtils.parseQueryStrings(req.query.state);
//     let cities = queryUtils.parseQueryStrings(req.query.city);
//     let regions = queryUtils.parseQueryStrings(req.query.region);
   
//     console.log(states);
//     console.log(cities);
//     console.log(regions);
 
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
//         let areas = yield Area.queryAllAreaName(options);
//         if(areas){
//             // let retunrnareas={
//             //     state:1,
//             //     msg:"查询成功",
//             //     pub:areas
//             // };
//             return res.jsonp(areas);
//         }else{
//             let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
//             return next(error);
//         }
//     }).catch(function (err) {
//         return next(err);
//     });
// };

// //获取所有省份--get
// const getAreasStateget = function (req, res, next) {
//     let queryUtils = require('../../utils/queryUtils');
//     //let ids = queryUtils.parseQueryIds(req.query.areaId);
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
//         let areas = yield Area.queryAllAreaState(options);
//         if(areas){
//            //取出statearray
//            //var stateArray=new Array();
//            let stateArray = {state:[]};
//            areas.forEach(function(item,index){  
//               // stateArray.push(item.dataValues.state);
//               stateArray.state.push(item.dataValues.state);
//            });
//            //去重
//            stateArray.state = unique(stateArray.state);    
//            //返回查询记录
//             // let retunrnareas={
//             //     state:1,
//             //     msg:"查询成功",
//             //     pub:stateArray
//             // };
//             return res.jsonp(areas);
//         }else{
//             let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
//             return next(error);
//         }
//     }).catch(function (err) {
//         return next(err);
//     });
// };

// //获取对应省份的所有市--get
// const getAreasCityget = function (req, res, next) {
//     let queryUtils = require('../../utils/queryUtils');
//     //let ids = queryUtils.parseQueryIds(req.query.areaId);
//     let states = queryUtils.parseQueryStrings(req.query.state);
//    // let cities = queryUtils.parseQueryStrings(req.query.city);
//    // let regions = queryUtils.parseQueryStrings(req.query.region);
   
//     let options = {
//         query: {},
//         pagination:req.pagination
        
//     };
//     console.log(req.pagination);
//     options.query.states = states;
//     //options.query.cities = cities;
//     //options.query.regions = regions;
//     console.log(options);
    
//     co(function*() {
//         let areas = yield Area.queryAllAreaCity(options);
//         if(areas){

//            //取出cityarray
//            //var cityArray=new Array();
//            let cityArray = {city:[]};
//            areas.forEach(function(item,index){  
//               // cityArray.push(item.dataValues.city);
//               cityArray.city.push(item.dataValues.city);
//            });
//            //去重
//            cityArray.city = unique(cityArray.city);        
//             // let retunrnareas={
//             //     state:1,
//             //     msg:"查询成功",
//             //     pub:cityArray
//             // };
//             return res.jsonp(cityArray);
//         }else{
//             let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
//             return next(error);
//         }
//     }).catch(function (err) {
//         return next(err);
//     });
// };

// //获取对应省份、市下属的所有区的医院--get1
// // const getAreasRegionget = function (req, res, next) {
// //     let queryUtils = require('../../utils/queryUtils');

// //     let states = queryUtils.parseQueryStrings(req.query.state);
// //     let cities = queryUtils.parseQueryStrings(req.query.city);
// //    // let regions = queryUtils.parseQueryStrings(req.query.region);
   
// //     let options = {
// //         query: {},
// //         pagination:req.pagination
        
// //     };
// //     console.log(req.pagination);
// //     options.query.states = states;
// //     options.query.cities = cities;
// //     //options.query.regions = regions;
// //     console.log(options);
    
// //     co(function*() {
// //         let areas = yield Area.queryAllAreaRegion(options);
// //         if(areas){
           
// //             //region+areaname拼接格式
// //             let returnArea={
// //                 list:[]
// //             }
            
// //             //取出regionarray
// //             var regionArray=new Array()
// //             areas.forEach(function(item,index){  
// //                 regionArray.push(item.dataValues.region);
// //             });
// //             //去重
// //             let uniqueRegionArray = unique(regionArray);
                
// //             //通过去重后的region进行遍历
// //                 for(let i = 0;i < uniqueRegionArray.length;i++){
// //                     //模型
// //                     let areamodel = {
// //                         region:{},
// //                         name:[]
// //                     };
// //                     //遍历每一个取到的医院实体进行区域选择
// //                     areas.forEach(function(item,index){ 
// //                         let areas = item.dataValues;
// //                         if(areas.region===uniqueRegionArray[i]){
// //                             areamodel.region=areas.region;
// //                             areamodel.name.push(areas.name);
// //                         };
// //                      }); 
// //                      returnArea.list.push(areamodel);
// //                 }
// //                 //去掉json初始化时候的[0]元素
// //                // returnArea.list.splice(0,1);
// //                // delete returnArea.list[0];

// //             let retunrnareas={
// //                 state:1,
// //                 msg:"查询成功",
// //                 pub:returnArea
// //             };
// //             return res.jsonp(retunrnareas);
// //         }else{
// //             let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
// //             return next(error);
// //         }
// //     }).catch(function (err) {
// //         return next(err);
// //     });
// // };

// //获取对应省份、市下属的所有区的医院--get2
// // const getAreasRegionget = function (req, res, next) {
// //     let queryUtils = require('../../utils/queryUtils');

// //     let states = queryUtils.parseQueryStrings(req.query.state);
// //     let cities = queryUtils.parseQueryStrings(req.query.city);
// //    // let regions = queryUtils.parseQueryStrings(req.query.region);
   
// //     let options = {
// //         query: {},
// //         pagination:req.pagination
        
// //     };
// //     console.log(req.pagination);
// //     options.query.states = states;
// //     options.query.cities = cities;
// //     //options.query.regions = regions;
// //     console.log(options);
    
// //     co(function*() {
// //         let areas = yield Area.queryAllAreaRegion(options);
// //         if(areas){
           
// //             let obj = {};
// //             areas.forEach(function(item,index){ 
// //                 let a = item.dataValues;
// //                 if(!obj.hasOwnProperty(a.region)){
// //                     obj[a.region] = [];
// //                     console.log(obj[a.region]);
// //                 }
// //             obj[a.region].push(a.name);
// //             console.log(obj[a.region]);
// //             });
// //             // //region+areaname拼接格式
// //             // let returnArea={
// //             //     list:[{region:{},name:[]}]
// //             // }
            
// //             // //取出regionarray
// //             // var regionArray=new Array()
// //             // areas.forEach(function(item,index){  
// //             //     regionArray.push(item.dataValues.region);
// //             // });
// //             // //去重
// //             // let uniqueRegionArray = unique(regionArray);
                
// //             // //通过去重后的region进行遍历
// //             //     for(let i = 0;i < uniqueRegionArray.length;i++){
// //             //         //模型
// //             //         let areamodel = {
// //             //             region:{},
// //             //             name:[]
// //             //         };
// //             //         //遍历每一个取到的医院实体进行区域选择
// //             //         areas.forEach(function(item,index){ 
// //             //             let areas = item.dataValues;
// //             //             if(areas.region===uniqueRegionArray[i]){
// //             //                 areamodel.region=areas.region;
// //             //                 areamodel.name.push(areas.name);
// //             //             };
// //             //          }); 
// //             //          returnArea.list.push(areamodel);
// //             //     }
// //             //     //去掉json初始化时候的[0]元素
// //             //     returnArea.list.splice(0,1);
// //             //    // delete returnArea.list[0];

// //             let retunrnareas={
// //                 state:1,
// //                 msg:"查询成功",
// //                 pub:obj
// //             };
// //             return res.jsonp(retunrnareas);
// //         }else{
// //             let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
// //             return next(error);
// //         }
// //     }).catch(function (err) {
// //         return next(err);
// //     });
// // };

// // //获取市--->区的医院信息--get3
// // const getAreasRegionget = function (req, res, next) {
// //     let queryUtils = require('../../utils/queryUtils');

// //     let states = queryUtils.parseQueryStrings(req.query.state);
// //     let cities = queryUtils.parseQueryStrings(req.query.city);
// //     let regions = queryUtils.parseQueryStrings(req.query.region);
   
// //     let options = {
// //         query: {},
// //         pagination:req.pagination
        
// //     };
// //     console.log(req.pagination);
// //     options.query.states = states;
// //     options.query.cities = cities;
// //     options.query.regions = regions;
// //     console.log(options);
    
// //     co(function*() {
// //         let areas = yield Area.queryAll(options);
// //         if(areas){
           
// //             //region+areaname拼接格式
// //             // var returnArea = {
// //             //     list:[{state:{},city:[{region:{},name:[]}]}]
// //             // }
// //             // let returnArea={
// //             //     city:{},
// //             //     regions:[]
// //             // }
// //             let returnArea={
// //                 list:[]
// //             }
// //             //取出stateArray、cityArray、regionArray
// //             //var stateArray=new Array();
// //             var cityArray=new Array();
// //             var regionArray=new Array();
// //             areas.forEach(function(item,index){  
// //                 //stateArray.push(item.dataValues.state);
// //                 cityArray.push(item.dataValues.city);
// //                 regionArray.push(item.dataValues.region);
// //             });
// //             //去重
// //             //let uniqueStateArray = unique(stateArray);
// //             let uniqueCityArray = unique(cityArray);
// //             let uniqueRegionArray = unique(regionArray);

                
// //             //通过去重后的region进行遍历
// //                 for(let i = 0;i < uniqueCityArray.length;i++){
// //                     //模型
// //                     let areamodel1 = {city:{},regions:[]};
// //                     //遍历每一个取到的医院实体进行区域选择
// //                     let obj = {};
// //                     areas.forEach(function(item,index){ 
// //                         //let areamode2 = {name:[]};
// //                         let area = item.dataValues;
// //                         if(area.city===uniqueCityArray[i]){
// //                             areamodel1.city = area.city;
                            
// //                             if(!obj.hasOwnProperty(area.region)){
// //                                 obj[area.region] = [];
// //                                 console.log(obj[area.region]);}
// //                             obj[area.region].push(area.name);
// //                             console.log(obj[area.region]);
                            
// //                         };
// //                      }); 
// //                      areamodel1.regions.push(obj);
// //                      //areamodel1.regions.splice(0,1);
// //                      returnArea.list.push(areamodel1);
// //                 }
// //                  //通过去重后的region进行遍历
// //                 //  for(let i = 0;i < uniqueCityArray.length;i++){
// //                 //     //模型
// //                 //     let areamodel1 = {};
// //                 //     //遍历每一个取到的医院实体进行区域选择
// //                 //     let obj = {};
// //                 //     areas.forEach(function(item,index){ 
// //                 //         //let areamode2 = {name:[]};
// //                 //         let area = item.dataValues;
// //                 //         if(area.city===uniqueCityArray[i]){
// //                 //             if(!areamodel1.hasOwnProperty(area.city)){
// //                 //                 areamodel1.city=area.city;
// //                 //                 areamodel1["regions"] = [];
// //                 //             }
// //                 //             areamodel1[area.city].push(area.city);
    
// //                 //             if(!obj.hasOwnProperty(area.region)){
// //                 //                 obj[area.region] = [];
// //                 //                 }
// //                 //             obj[area.region].push(area.name);
                          
// //                 //         };
// //                 //      }); 
// //                 //      areamodel1.regions.push(obj);
// //                 //      //areamodel1.regions.splice(0,1);
// //                 //      returnArea.list.push(areamodel1);
// //                 // }
                
                
// //                 //returnArea.list.splice(0,1);

// //                 // returnArea.list["regions"]=[];
// //                 // returnArea.list.regions["name"]=[];

// //                 // for(let i = 0;i < uniqueCityArray.length;i++){



// //                 //     areas.forEach(function(item,index){ 
// //                 //         let area = item.dataValues;
// //                 //         returnArea.list.city = area.city;
// //                 //         if(returnArea.list.city===uniqueCityArray[i]){
// //                 //          returnArea.list.regions.region = area.region;
// //                 //          for(let j = 0;j < uniqueRegionArray.length;j++){
// //                 //              if(returnArea.list.regions.region===uniqueRegionArray[j]){
// //                 //                 returnArea.list.regions.name.push(area.name);
// //                 //              }
// //                 //          }
// //                 //         }

// //                 //     });
// //                 //     returnArea.list.push(returnArea.list);



// //                 // }



// //                 //去掉json初始化时候的[0]元素
// //                // returnArea.list.splice(0,1);
// //                // delete returnArea.list[0];

// //             let retunrnareas={
// //                 state:1,
// //                 msg:"查询成功",
// //                 pub:returnArea
// //             };
// //             return res.jsonp(retunrnareas);
// //         }else{
// //             let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
// //             return next(error);
// //         }
// //     }).catch(function (err) {
// //         return next(err);
// //     });
// // };


// //获取市--->区的医院信息--get4(key是数据)
// // const getAreasRegionget = function (req, res, next) {
// //     let queryUtils = require('../../utils/queryUtils');

// //     let states = queryUtils.parseQueryStrings(req.query.state);
// //     let cities = queryUtils.parseQueryStrings(req.query.city);
// //     let regions = queryUtils.parseQueryStrings(req.query.region);
   
// //     let options = {
// //         query: {},
// //         pagination:req.pagination
        
// //     };
// //     console.log(req.pagination);
// //     options.query.states = states;
// //     options.query.cities = cities;
// //     options.query.regions = regions;
// //     console.log(options);
    
// //     co(function*() {
// //         let areas = yield Area.queryAll(options);
// //         if(areas){
           
// //             //region+areaname拼接格式
// //             let returnArea={
// //                 list:[]
// //             }
// //             //取出stateArray、cityArray、regionArray
// //             //var stateArray=new Array();
// //             var cityArray=new Array();
// //             var regionArray=new Array();
// //             areas.forEach(function(item,index){  
// //                 //stateArray.push(item.dataValues.state);
// //                 cityArray.push(item.dataValues.city);
// //                 regionArray.push(item.dataValues.region);
// //             });
// //             //去重
// //             //let uniqueStateArray = unique(stateArray);
// //             let uniqueCityArray = unique(cityArray);
// //             let uniqueRegionArray = unique(regionArray);

// //                  //通过去重后的region进行遍历
// //                  for(let i = 0;i < uniqueCityArray.length;i++){
// //                     //模型
// //                     let areamodel1 = {};
// //                     //遍历每一个取到的医院实体进行区域选择
// //                     let obj = {};
// //                     areas.forEach(function(item,index){ 
// //                         //let areamode2 = {name:[]};
// //                         let area = item.dataValues;
// //                         if(area.city===uniqueCityArray[i]){
// //                             if(!areamodel1.hasOwnProperty(area.city)){
// //                                 areamodel1[area.city] = [];
// //                             }
// //                             if(!obj.hasOwnProperty(area.region)){
// //                                 obj[area.region] = [];
// //                                 }
// //                             obj[area.region].push(area.name);
// //                         };
// //                     });
// //                     areamodel1[uniqueCityArray[i]].push(obj);
                   
// //                      returnArea.list.push(areamodel1);
// //                 }
                
// //             let retunrnareas={
// //                 state:1,
// //                 msg:"查询成功",
// //                 pub:returnArea
// //             };
// //             return res.jsonp(retunrnareas);
// //         }else{
// //             let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
// //             return next(error);
// //         }
// //     }).catch(function (err) {
// //         return next(err);
// //     });
// // };

//获取地区信息
const getAreasRegionget = function (req, res, next) {
    let queryUtils = require('../../utils/queryUtils');

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
        let areas = yield Area.queryAll(options);
        if(areas){
            let returnAreas=[];
            //取出stateArray、cityArray、regionArray/alphabetArray
            //var stateArray=new Array();
            var cityArray=new Array();
            //var regionArray=new Array();
            var alphabetArray = new Array();
            areas.forEach(function(item,index){  
                //stateArray.push(item.dataValues.state);
                cityArray.push(item.dataValues.city);
                //regionArray.push(item.dataValues.region);
                alphabetArray.push(item.dataValues.alphabet);
            });
            //去重
            //let uniqueStateArray = unique(stateArray);
            let uniqueCityArray = unique(cityArray);
           // let uniqueRegionArray = unique(regionArray);
            let uniqueAlphabetArray = unique(alphabetArray);

                
                  for(let i = 0;i < uniqueAlphabetArray.length;i++){
                    //模型
                    let areamodel1 = {AlphabetStr:{},list:[]};
                    for(let j = 0;j < uniqueCityArray.length;j++){
                    //遍历每一个取到的医院实体进行区域选择
                    let obj = {};
                    areas.forEach(function(item,index){ 
                        let area = item.dataValues;
                        if(area.alphabet===uniqueAlphabetArray[i]){
                            areamodel1.AlphabetStr = area.alphabet;
                            // {
                            //     AlphabetStr:
                            //     // alphabet:area.alphabet
                            // }
                                if(area.city===uniqueCityArray[j]){
                                    obj.AreaCode=area.areacode;
                                    obj.AreaName=area.city;
                                    obj.AlphabetStr=area.alphabet;
                                }
                                };
                            }); 
                            //去除没查到数据时候的obj
                            if(obj.AreaName){
                                areamodel1.list.push(obj);
                            }
                        }
                        returnAreas.push(areamodel1);
                }

             
             var sort = require('../../utils/sort');

            var sortAreas= sort.sortObj(returnAreas,'AlphabetStr','asc');
            return res.jsonp(sortAreas);
        }else{
            let error = errors.newError(errors.types.TYPE_API_HOSPITAL_HOSPITAL_NOT_FOUND);
            return next(error);
        }
    }).catch(function (err) {
        return next(err);
    });
};

// //去重
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
exports.getAreasget = getAreasget;
exports.getAreasRegionget = getAreasRegionget;
// exports.getAreasget = [getAreasget];
// exports.getAreaspost = [getAreaspost];
// exports.getAreasId = [findArea, getAreasId];
// exports.postAddArea=postAddArea;
// exports.deleteAreaById = deleteAreaById;
// exports.putUpdateArea = [findUpdateArea,putUpdateArea];
// exports.patchUpdateArea = patchUpdateArea;
// exports.getAreasNameget = getAreasNameget;
// exports.getAreasStateget = getAreasStateget;
// exports.getAreasCityget = getAreasCityget;
// exports.getAreasRegionget = getAreasRegionget;



// exports.getAreasState = [findAreabyState,getAreasState];
// exports.getAreasStateCityRegion = [findAreabyStateCityRegion,getAreasStateCityRegion];