/**
 * 平台判断工具
 * 编译时确定平台类型,零运行时开销
 */

/**
 * 平台类型常量
 */
export const PlatformType = {
    // Web 端
    H5: 'H5',

    // 小程序端
    MP_WEIXIN: 'MP-WEIXIN',       // 微信小程序
    MP_ALIPAY: 'MP-ALIPAY',       // 支付宝小程序
    MP_BAIDU: 'MP-BAIDU',         // 百度小程序
    MP_TOUTIAO: 'MP-TOUTIAO',     // 字节跳动小程序(抖音/头条)
    MP_QQ: 'MP-QQ',               // QQ 小程序
    MP_KUAISHOU: 'MP-KUAISHOU',   // 快手小程序
    MP_LARK: 'MP-LARK',           // 飞书小程序
    MP_JD: 'MP-JD',               // 京东小程序
    MP_360: 'MP-360',             // 360 小程序
    MP_DINGTALK: 'MP-DINGTALK',   // 钉钉小程序

    // 快应用
    QUICKAPP_WEBVIEW: 'QUICKAPP-WEBVIEW',           // 快应用通用
    QUICKAPP_WEBVIEW_UNION: 'QUICKAPP-WEBVIEW-UNION', // 快应用联盟
    QUICKAPP_WEBVIEW_HUAWEI: 'QUICKAPP-WEBVIEW-HUAWEI', // 华为快应用

    // App 端
    APP: 'APP',                   // iOS/Android App
    APP_IOS: 'APP-IOS',           // iOS App
    APP_ANDROID: 'APP-ANDROID',   // Android App
    APP_HARMONY: 'APP-HARMONY',   // 鸿蒙 App

    UNKNOWN: 'UNKNOWN',
} as const;

/**
 * 平台类型(类型定义)
 */
export type PlatformType = typeof PlatformType[keyof typeof PlatformType];

/**
 * 平台常量(编译时确定)
 * 使用条件编译在打包时确定具体值,避免运行时判断
 */
let CURRENT_PLATFORM: PlatformType = PlatformType.UNKNOWN;
let IS_H5: boolean = false;
let IS_MP: boolean = false;
let IS_APP: boolean = false;

// #ifdef H5
CURRENT_PLATFORM = PlatformType.H5;
IS_H5 = true;
IS_MP = false;
IS_APP = false;
// #endif

// #ifdef MP-WEIXIN
CURRENT_PLATFORM = PlatformType.MP_WEIXIN;
IS_H5 = false;
IS_MP = true;
IS_APP = false;
// #endif

// #ifdef MP-ALIPAY
CURRENT_PLATFORM = PlatformType.MP_ALIPAY;
IS_H5 = false;
IS_MP = true;
IS_APP = false;
// #endif

// #ifdef MP-BAIDU
CURRENT_PLATFORM = PlatformType.MP_BAIDU;
IS_H5 = false;
IS_MP = true;
IS_APP = false;
// #endif

// #ifdef MP-TOUTIAO
CURRENT_PLATFORM = PlatformType.MP_TOUTIAO;
IS_H5 = false;
IS_MP = true;
IS_APP = false;
// #endif

// #ifdef MP-QQ
CURRENT_PLATFORM = PlatformType.MP_QQ;
IS_H5 = false;
IS_MP = true;
IS_APP = false;
// #endif

// #ifdef MP-KUAISHOU
CURRENT_PLATFORM = PlatformType.MP_KUAISHOU;
IS_H5 = false;
IS_MP = true;
IS_APP = false;
// #endif

// #ifdef APP-PLUS
CURRENT_PLATFORM = PlatformType.APP;
IS_H5 = false;
IS_MP = false;
IS_APP = true;
// #endif

// 导出平台常量
export { CURRENT_PLATFORM, IS_H5, IS_MP, IS_APP };

/**
 * 平台工具对象
 * 提供两种使用方式:
 * 1. 直接使用常量: IS_H5, IS_MP, IS_APP, CURRENT_PLATFORM (推荐,性能更好)
 * 2. 使用函数: platform.isH5() (兼容旧代码)
 */
export const platform = {
    /** 当前平台类型 */
    get type() {
        return CURRENT_PLATFORM;
    },

    /** 是否为 H5(推荐直接使用 IS_H5 常量) */
    isH5: () => IS_H5,

    /** 是否为微信小程序 */
    isWeixin: () => CURRENT_PLATFORM === PlatformType.MP_WEIXIN,

    /** 是否为支付宝小程序 */
    isAlipay: () => CURRENT_PLATFORM === PlatformType.MP_ALIPAY,

    /** 是否为百度小程序 */
    isBaidu: () => CURRENT_PLATFORM === PlatformType.MP_BAIDU,

    /** 是否为头条小程序 */
    isToutiao: () => CURRENT_PLATFORM === PlatformType.MP_TOUTIAO,

    /** 是否为 QQ 小程序 */
    isQQ: () => CURRENT_PLATFORM === PlatformType.MP_QQ,

    /** 是否为快手小程序 */
    isKuaishou: () => CURRENT_PLATFORM === PlatformType.MP_KUAISHOU,

    /** 是否为小程序(推荐直接使用 IS_MP 常量) */
    isMiniProgram: () => IS_MP,

    /** 是否为 App(推荐直接使用 IS_APP 常量) */
    isApp: () => IS_APP,
};
