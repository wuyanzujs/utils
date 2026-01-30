/**
 * UniApp 路由工具 - 统一导出
 * 
 * 使用示例:
 * ```typescript
 * import router from '@/utils/router';
 * 
 * // 跳转
 * router.navigateTo('/pages/detail/index', { id: 123 });
 * 
 * // 平台判断
 * if (router.IS_H5) {
 *   console.log('H5 环境');
 * }
 * 
 * // 路由守卫
 * router.addGuard(async (to, from) => {
 *   // 验证逻辑
 *   return true;
 * });
 * ```
 */

// 路由跳转
export {
    navigate,
    navigateTo,
    redirectTo,
    reLaunch,
    switchTab,
    navigateBack,
    navigateBackTo,
    type NavigateOptions,
    type NavigateBackOptions,
    type NavigateType,
} from './router';

// 路由守卫
export {
    addGuard,
    removeGuard,
    clearGuards,
    setLogEnabled,
    getHistory,
    clearHistory,
    type RouteGuard,
} from './guards';

// 页面栈管理
export {
    getCurrentPath,
    getPageStack,
    canGoBack,
    parseUrlParams,
} from './page';

// 平台判断
export {
    platform,
    CURRENT_PLATFORM,
    IS_H5,
    IS_MP,
    IS_APP,
    PlatformType,
} from './platform';

// 默认导出
import * as router from './router';
import * as guards from './guards';
import * as page from './page';
import * as platformModule from './platform';

export default {
    // 路由跳转
    ...router,

    // 路由守卫
    ...guards,

    // 页面栈
    ...page,

    // 平台判断
    platform: platformModule.platform,
    CURRENT_PLATFORM: platformModule.CURRENT_PLATFORM,
    IS_H5: platformModule.IS_H5,
    IS_MP: platformModule.IS_MP,
    IS_APP: platformModule.IS_APP,
    PlatformType: platformModule.PlatformType,
};
