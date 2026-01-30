/**
 * 路由跳转工具函数
 * 提供统一的页面跳转 API,兼容小程序和 H5
 */

import { getCurrentPath } from './page';
import { log, executeGuards, recordHistory } from './internal';

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
    /** 动画类型(仅部分平台支持) */
    animationType?: 'pop-in' | 'pop-out' | 'fade-in' | 'fade-out' | 'slide-in-right' | 'slide-out-right';
    /** 动画时长(ms) */
    animationDuration?: number;
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

// ==================== 工具函数 ====================

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
 * 统一跳转方法
 */
export async function navigate(options: NavigateOptions): Promise<void> {
    const {
        url,
        type = 'navigateTo',
        params,
        animationType,
        animationDuration,
        success,
        fail,
        complete,
    } = options;

    // 构建完整 URL
    const fullUrl = buildUrl(url, params);
    const currentPath = getCurrentPath();

    // 执行路由守卫
    const canNavigate = await executeGuards(url, currentPath, params);
    if (!canNavigate) {
        fail?.({ errMsg: '路由守卫拦截' });
        complete?.();
        return;
    }

    // 记录历史
    recordHistory(fullUrl);
    log(`跳转: ${type}`, { from: currentPath, to: fullUrl });

    // 构建 uni 跳转参数
    const uniOptions: any = {
        url: fullUrl,
        animationType,
        animationDuration,
        success: () => {
            log(`跳转成功: ${fullUrl}`);
            success?.();
        },
        fail: (error: any) => {
            console.error(`[Router] 跳转失败: ${fullUrl}`, error);
            fail?.(error);
        },
        complete,
    };

    // 根据类型执行跳转
    try {
        switch (type) {
            case 'navigateTo':
                uni.navigateTo(uniOptions);
                break;
            case 'redirectTo':
                uni.redirectTo(uniOptions);
                break;
            case 'reLaunch':
                uni.reLaunch(uniOptions);
                break;
            case 'switchTab':
                // switchTab 不支持传参
                uni.switchTab({ url, success, fail, complete });
                break;
            case 'navigateBack':
                uni.navigateBack({ delta: 1, success, fail, complete });
                break;
            default:
                throw new Error(`未知的跳转类型: ${type}`);
        }
    } catch (error) {
        console.error('[Router] 跳转异常:', error);
        fail?.(error as any);
        complete?.();
    }
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

        log(`返回上一页: delta=${delta}`);

        uni.navigateBack({
            delta,
            success: () => {
                log('返回成功');
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
export function navigateBackTo(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const pages = getCurrentPages();
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
