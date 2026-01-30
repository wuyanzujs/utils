/**
 * 页面栈管理工具
 * 提供页面栈相关的查询和操作功能
 */

/**
 * 解析 URL 参数
 */
export function parseUrlParams(url: string): Record<string, any> {
    const queryIndex = url.indexOf('?');
    if (queryIndex === -1) return {};

    const queryString = url.substring(queryIndex + 1);
    const params: Record<string, any> = {};

    queryString.split('&').forEach((pair) => {
        const [key, value] = pair.split('=');
        if (key) {
            try {
                params[key] = JSON.parse(decodeURIComponent(value));
            } catch {
                params[key] = decodeURIComponent(value);
            }
        }
    });

    return params;
}

/**
 * 获取当前页面路径
 */
export function getCurrentPath(): string {
    const pages = getCurrentPages();
    if (pages.length === 0) return '';

    const currentPage = pages[pages.length - 1];
    return `/${(currentPage as any).route}`;
}

/**
 * 获取页面栈信息
 */
export function getPageStack(): Array<{ route: string; options: any }> {
    const pages = getCurrentPages();
    return pages.map((page: any) => ({
        route: `/${page.route}`,
        options: page.options,
    }));
}

/**
 * 判断是否可以返回
 */
export function canGoBack(): boolean {
    const pages = getCurrentPages();
    return pages.length > 1;
}
