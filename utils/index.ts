/**
 * UniApp 路由工具 - 统一导出
 * 
 * 使用示例:
 * ```typescript
 * import router from '@/utils/router';
 * 
 * // 内部页面跳转
 * router.navigateTo('/pages/detail/index', { id: 123 });
 * 
 * // 外部 H5 页面(在 webview 中打开)
 * router.openExternalUrl({
 *   url: 'https://example.com/h5',
 *   mode: 'webview',
 *   webviewPath: '/pages/webview/index'
 * });
 * 
 * // 智能跳转(自动识别)
 * router.smartNavigate('https://example.com/h5', {}, {
 *   webviewPath: '/pages/webview/index'
 * });
 * 
 * // 平台判断
 * if (router.IS_H5) {
 *   console.log('H5 环境');
 * }
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
    openExternalUrl,
    smartNavigate,
    isExternalUrl,
    type NavigateOptions,
    type NavigateBackOptions,
    type NavigateType,
    type ExternalLinkOptions,
} from './router';

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
import * as page from './page';
import * as platformModule from './platform';

export default {
    // 路由跳转
    ...router,

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
