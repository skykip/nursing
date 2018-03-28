"use strict";
/**
 * 云通信基础能力业务短信发送、查询详情以及消费消息示例，供参考。
 * Created on 2017-07-31
 *
 * 安装阿里短信模块
 * npm install @alicloud/sms-sdk --save
 */
const Promise = require('bluebird');
const SMSClient = require("@alicloud/sms-sdk");
// ACCESS_KEY_ID/ACCESS_KEY_SECRET 根据实际申请的账号信息进行替换
// const accessKeyId = "RO2xkoMeIrqzfPgm";
// const secretAccessKey = "ebM8kYWbN7qsgxj48OBL5SO5S8uyhI";
const accessKeyId = "LTAIP9elMdpQKgYi";
const secretAccessKey = "kZaGoaV3TtabEGQzwizK1saOTSKUJp";

function AliTechSms() {

    //初始化sms_client
    let smsClient = new SMSClient({ accessKeyId, secretAccessKey });

    let sendSms = function (phoneNum, content, cb) {
        //发送短信
        smsClient.sendSMS({
                PhoneNumbers: phoneNum, //接收验证码的手机号码，可用逗号分隔多个
                // SignName: "好陪护", //签名，因为仅申请了这个模版，所以不要改动
                // TemplateCode: "SMS_125021102", //短信模版编号，因为仅申请了这个模版，所以不要改动
                SignName: "好陪护提醒您", //签名，因为仅申请了这个模版，所以不要改动
                TemplateCode: "SMS_128900114", //短信模版编号，因为仅申请了这个模版，所以不要改动
                TemplateParam: '{"code":"' + content + '"}' //随机码内容
            }).then(
                function (res) {
                    console.log(res);
                    let { Code } = res;
                    if (Code === "OK") {
                        //处理返回参数
                        console.log(res.Message);
                        cb(null, true);
                    }else{
                        cb(new Error("Send sms failed, result=" + res));
                    }
                },
                function (err) {
                    console.log(err);
                    cb(new Error("Send sms failed, err=" + err));
                }
            );
    };
    this.sendSms = Promise.promisify(sendSms);
}

let aliSms = new AliTechSms();

function sendSms(phoneNum, text) {
    return aliSms.sendSms(phoneNum, text);
}

module.exports = {
    sendSms: sendSms
};