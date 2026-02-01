/// <reference path="./types.d.ts" />

/**
 * 路由跳转工具函数
 * 提供统一的页面跳转 API,专为 H5 和小程序设计
 * 支持内部页面跳转和外部 H5 页面跳转
 */

import { IS_H5, IS_MP } from './platform';

// ==================== 类型定义 ====================

/** 跳转类型 */
export type NavigateType = 'navigateTo' | 'redirectTo' | 'reLaunch' | 'switchTab' | 'navigateBack';

/** 跳转参数 */
export interface NavigateOptions {
    /** 页面路径 */
    url: string;
    /** 跳转类型,默认 navigateTo */
    type?: NavigateType;
    /** 路由参数 */
    params?: Record<string, any>;
    /** 成功回调 */
    success?: () => void;
    /** 失败回调 */
    fail?: (error: any) => void;
    /** 完成回调 */
    complete?: () => void;
}

/** 返回参数 */
export interface NavigateBackOptions {
    /** 返回的层数,默认 1 */
    delta?: number;
    /** 成功回调 */
    success?: () => void;
    /** 失败回调 */
    fail?: (error: any) => void;
}

/** 外部链接跳转参数 */
export interface ExternalLinkOptions {
    /** 外部 URL */
    url: string;
    /** 
     * 跳转方式
     * - webview: 在小程序 web-view 中打开(需要配置业务域名)
     * - redirect: H5 环境下直接跳转
     */
    mode?: 'webview' | 'redirect';
    /** web-view 页面路径(使用 webview 模式时必填) */
    webviewPath?: string;
    /** 成功回调 */
    success?: () => void;
    /** 失败回调 */
    fail?: (error: any) => void;
}

// ==================== 工具函数 ====================

/**
 * 判断是否为外部链接
 */
export function isExternalUrl(url: string): boolean {
    return /^https?:\/\//i.test(url);
}

/**
 * 构建完整的 URL(包含参数)
 */
function buildUrl(url: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
        return url;
    }

    const queryString = Object.entries(params)
        .map(([key, value]) => {
            const encodedValue = encodeURIComponent(
                typeof value === 'object' ? JSON.stringify(value) : String(value)
            );
            return `${key}=${encodedValue}`;
        })
        .join('&');

    return url.includes('?') ? `${url}&${queryString}` : `${url}?${queryString}`;
}

// ==================== 核心跳转函数 ====================

/**
 * 统一跳转方法(仅用于内部页面)
 */
export function navigate(options: NavigateOptions): Promise<void> {
    const {
        url,
        type = 'navigateTo',
        params,
        success,
        fail,
        complete,
    } = options;

    // 构建完整 URL
    const fullUrl = buildUrl(url, params);

    // 使用 Promise 包装，确保在跳转完成后才 resolve
    return new Promise((resolve, reject) => {
        const handleSuccess = () => {
            success?.();
            resolve();
        };

        const handleFail = (error: any) => {
            console.error(`[Router] 跳转失败: ${fullUrl}`, error);
            fail?.(error);
            reject(error);
        };

        const handleComplete = () => {
            complete?.();
        };

        try {
            switch (type) {
                case 'navigateTo':
                    uni.navigateTo({
                        url: fullUrl,
                        success: handleSuccess,
                        fail: handleFail,
                        complete: handleComplete,
                    });
                    break;
                case 'redirectTo':
                    uni.redirectTo({
                        url: fullUrl,
                        success: handleSuccess,
                        fail: handleFail,
                        complete: handleComplete,
                    });
                    break;
                case 'reLaunch':
                    uni.reLaunch({
                        url: fullUrl,
                        success: handleSuccess,
                        fail: handleFail,
                        complete: handleComplete,
                    });
                    break;
                case 'switchTab':
                    // switchTab 不支持传参
                    uni.switchTab({
                        url,
                        success: handleSuccess,
                        fail: handleFail,
                        complete: handleComplete,
                    });
                    break;
                case 'navigateBack':
                    uni.navigateBack({
                        delta: 1,
                        success: handleSuccess,
                        fail: handleFail,
                        complete: handleComplete,
                    });
                    break;
                default:
                    const error = new Error(`未知的跳转类型: ${type}`);
                    console.error('[Router]', error);
                    reject(error);
            }
        } catch (error) {
            console.error('[Router] 跳转异常:', error);
            handleFail(error);
        }
    });
}

/**
 * 打开外部链接
 * 
 * 使用示例:
 * ```typescript
 * // 方式1: 在 web-view 中打开(小程序)
 * openExternalUrl({
 *   url: 'https://example.com/h5-page',
 *   mode: 'webview',
 *   webviewPath: '/pages/webview/index'
 * });
 * 
 * // 方式2: H5 环境直接跳转
 * openExternalUrl({
 *   url: 'https://example.com/h5-page',
 *   mode: 'redirect'
 * });
 * ```
 */
export function openExternalUrl(options: ExternalLinkOptions): Promise<void> {
    const { url, mode = 'webview', webviewPath, success, fail } = options;

    return new Promise((resolve, reject) => {
        try {
            // H5 环境
            if (IS_H5) {
                if (mode === 'redirect') {
                    window.location.href = url;
                } else {
                    // H5 默认在新窗口打开
                    window.open(url, '_blank');
                }
                success?.();
                resolve();
                return;
            }

            // 小程序环境
            if (IS_MP) {
                switch (mode) {
                    case 'webview':
                        // 在 web-view 页面中打开
                        if (!webviewPath) {
                            const error = new Error('使用 webview 模式需要提供 webviewPath 参数');
                            fail?.(error);
                            reject(error);
                            return;
                        }
                        uni.navigateTo({
                            url: `${webviewPath}?url=${encodeURIComponent(url)}`,
                            success: () => {
                                success?.();
                                resolve();
                            },
                            fail: (error) => {
                                fail?.(error);
                                reject(error);
                            },
                        });
                        break;

                    case 'redirect':
                        // 小程序环境下 redirect 模式降级为 webview
                        if (!webviewPath) {
                            const error = new Error('使用 redirect 模式需要提供 webviewPath 参数');
                            fail?.(error);
                            reject(error);
                            return;
                        }
                        uni.navigateTo({
                            url: `${webviewPath}?url=${encodeURIComponent(url)}`,
                            success: () => {
                                success?.();
                                resolve();
                            },
                            fail: (error) => {
                                fail?.(error);
                                reject(error);
                            },
                        });
                        break;

                    default:
                        const error = new Error(`未知的跳转模式: ${mode}`);
                        fail?.(error);
                        reject(error);
                }
            } else {
                const error = new Error('当前环境不支持外部链接跳转');
                fail?.(error);
                reject(error);
            }
        } catch (error) {
            console.error('[Router] 打开外部链接失败:', error);
            fail?.(error);
            reject(error);
        }
    });
}

/**
 * 智能跳转 - 自动识别内部/外部链接
 * 
 * 使用示例:
 * ```typescript
 * // 内部页面
 * smartNavigate('/pages/detail/index', { id: 123 });
 * 
 * // 外部链接(自动识别并使用 webview 打开)
 * smartNavigate('https://example.com/page', {}, {
 *   webviewPath: '/pages/webview/index'
 * });
 * ```
 */
export function smartNavigate(
    url: string,
    params?: Record<string, any>,
    externalOptions?: Omit<ExternalLinkOptions, 'url'>
): Promise<void> {
    if (isExternalUrl(url)) {
        return openExternalUrl({
            url: buildUrl(url, params),
            ...externalOptions,
        });
    }
    return navigateTo(url, params);
}

/**
 * 打开新页面(保留当前页面)
 */
export function navigateTo(url: string, params?: Record<string, any>): Promise<void> {
    return navigate({ url, type: 'navigateTo', params });
}

/**
 * 重定向(关闭当前页面)
 */
export function redirectTo(url: string, params?: Record<string, any>): Promise<void> {
    return navigate({ url, type: 'redirectTo', params });
}

/**
 * 重启应用(关闭所有页面)
 */
export function reLaunch(url: string, params?: Record<string, any>): Promise<void> {
    return navigate({ url, type: 'reLaunch', params });
}

/**
 * 切换 Tab(只能跳转到 tabBar 页面)
 */
export function switchTab(url: string): Promise<void> {
    return navigate({ url, type: 'switchTab' });
}

/**
 * 返回上一页
 */
export function navigateBack(options?: NavigateBackOptions): Promise<void> {
    return new Promise((resolve, reject) => {
        const { delta = 1, success, fail } = options || {};

        uni.navigateBack({
            delta,
            success: () => {
                success?.();
                resolve();
            },
            fail: (error: any) => {
                console.error('[Router] 返回失败:', error);
                fail?.(error);
                reject(error);
            },
        });
    });
}

/**
 * 返回到指定页面
 */
// 注意: navigateBackTo 功能依赖 getCurrentPages API
// 在某些小程序环境中可能需要额外配置
export function navigateBackTo(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // H5 和小程序环境都支持 getCurrentPages
        const pages: any[] = getCurrentPages?.() || [];
        const targetIndex = pages.findIndex((page: any) => `/${page.route}` === url);

        if (targetIndex === -1) {
            const error = new Error(`未找到目标页面: ${url}`);
            console.error('[Router]', error);
            reject(error);
            return;
        }

        const delta = pages.length - 1 - targetIndex;
        if (delta <= 0) {
            resolve();
            return;
        }

        navigateBack({ delta })
            .then(resolve)
            .catch(reject);
    });
}
