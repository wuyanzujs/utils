/**
 * UniApp 全局类型声明
 * 为 UniApp 运行时 API 提供类型定义
 */

/** 页面实例 */
interface UniPage {
    /** 页面路由路径 */
    route: string;
    /** 页面参数 */
    options: Record<string, any>;
    /** 页面的 data 数据 */
    $vm?: any;
}

/** 获取当前页面栈 */
declare function getCurrentPages(): UniPage[];

/** UniApp 全局对象 */
declare const uni: {
    navigateTo(options: {
        url: string;
        animationType?: string;
        animationDuration?: number;
        success?: () => void;
        fail?: (error: any) => void;
        complete?: () => void;
    }): void;

    redirectTo(options: {
        url: string;
        success?: () => void;
        fail?: (error: any) => void;
        complete?: () => void;
    }): void;

    reLaunch(options: {
        url: string;
        success?: () => void;
        fail?: (error: any) => void;
        complete?: () => void;
    }): void;

    switchTab(options: {
        url: string;
        success?: () => void;
        fail?: (error: any) => void;
        complete?: () => void;
    }): void;

    navigateBack(options: {
        delta?: number;
        success?: () => void;
        fail?: (error: any) => void;
        complete?: () => void;
    }): void;
};

/** 微信 JSSDK 类型 */
interface WeixinJSSDK {
    miniProgram?: {
        getEnv: (callback: (res: { miniprogram: boolean }) => void) => void;
        navigateTo: (options: { url: string }) => void;
        navigateBack: (options?: { delta?: number }) => void;
        postMessage: (data: any) => void;
    };
}

/** 支付宝 JSSDK 类型 */
interface AlipayJSSDK {
    getEnv?: (callback: (res: { miniprogram: boolean }) => void) => void;
    postMessage?: (data: any) => void;
    navigateTo?: (options: { url: string }) => void;
    navigateBack?: (options?: { delta?: number }) => void;
}

/** 扩展 Window 接口 */
declare global {
    interface Window {
        /** 微信 JSSDK */
        wx?: WeixinJSSDK;
        /** 支付宝 JSSDK */
        my?: AlipayJSSDK;
    }
}

export { };
