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

    // ========== Storage 同步 API ==========

    /** 同步获取存储值 */
    getStorageSync(key: string): any;

    /** 同步设置存储值 */
    setStorageSync(key: string, data: any): void;

    /** 同步删除存储值 */
    removeStorageSync(key: string): void;

    /** 同步清空存储 */
    clearStorageSync(): void;

    /** 同步获取存储信息 */
    getStorageInfoSync(): {
        keys: string[];
        currentSize: number;
        limitSize: number;
    };

    // ========== Storage 异步 API ==========

    /** 异步获取存储值 */
    getStorage(options: {
        key: string;
        success?: (res: { data: any }) => void;
        fail?: (error: any) => void;
        complete?: () => void;
    }): void;

    /** 异步设置存储值 */
    setStorage(options: {
        key: string;
        data: any;
        success?: () => void;
        fail?: (error: any) => void;
        complete?: () => void;
    }): void;

    /** 异步删除存储值 */
    removeStorage(options: {
        key: string;
        success?: () => void;
        fail?: (error: any) => void;
        complete?: () => void;
    }): void;

    /** 异步清空存储 */
    clearStorage(options?: {
        success?: () => void;
        fail?: (error: any) => void;
        complete?: () => void;
    }): void;

    /** 异步获取存储信息 */
    getStorageInfo(options: {
        success?: (res: { keys: string[]; currentSize: number; limitSize: number }) => void;
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
interface Window {
    /** 微信 JSSDK */
    wx?: WeixinJSSDK;
    /** 支付宝 JSSDK */
    my?: AlipayJSSDK;
}
