/**
 * 运行时环境检测工具
 * 用于 H5 页面判断当前运行在哪个宿主环境中
 * 
 * 重要说明:
 * H5 页面在小程序 web-view 中运行时,需要手动引入对应的 SDK:
 * - 微信小程序: <script src="https://res.wx.qq.com/open/js/jweixin-1.3.2.js"></script>
 * - 支付宝小程序: <script src="https://appx/web-view.min.js"></script>
 * 
 * 引入 SDK 后才能使用小程序 API,如 wx.miniProgram.getEnv()、my.getEnv() 等
 * 
 * 本工具提供基于 User Agent 的环境判断,可以区分:
 * - 是否在微信/支付宝等 App 中
 * - 但无法区分是小程序 web-view 还是内置浏览器
 * 
 * 如需精确判断是否在小程序中,请:
 * 1. 引入对应平台的 SDK
 * 2. 使用 SDK 提供的 getEnv 方法判断
 */

// ==================== 类型定义 ====================

/**
 * 运行时环境类型常量
 */
export const RuntimeEnv = {
    /** 独立的浏览器环境 */
    BROWSER: 'browser',
    /** 微信环境(可能是小程序或浏览器,需引入 SDK 后精确判断) */
    WEIXIN: 'weixin',
    /** 支付宝环境(可能是小程序或浏览器,需引入 SDK 后精确判断) */
    ALIPAY: 'alipay',
    /** 百度环境 */
    BAIDU: 'baidu',
    /** 头条环境 */
    TOUTIAO: 'toutiao',
    /** QQ 环境 */
    QQ: 'qq',
    /** 快手环境 */
    KUAISHOU: 'kuaishou',
    /** 未知环境 */
    UNKNOWN: 'unknown',
} as const;

/**
 * 运行时环境类型(类型定义)
 */
export type RuntimeEnv = typeof RuntimeEnv[keyof typeof RuntimeEnv];

/**
 * 环境检测结果
 */
export interface EnvDetectResult {
    /** 运行时环境类型 */
    env: RuntimeEnv;
    /** 是否在微信环境中 */
    isInWeixin: boolean;
    /** 是否在支付宝环境中 */
    isInAlipay: boolean;
    /** 是否在独立浏览器中 */
    isInBrowser: boolean;
    /** User Agent */
    userAgent: string;
}

/**
 * SDK 加载配置
 */
export interface SDKConfig {
    /** 微信 JSSDK URL */
    weixinSDK?: string;
    /** 支付宝 SDK URL */
    alipaySDK?: string;
    /** SDK 加载超时时间(ms) */
    timeout?: number;
}

// ==================== 环境检测 ====================

/**
 * 获取 User Agent
 */
function getUserAgent(): string {
    return navigator.userAgent.toLowerCase();
}

/**
 * 检测是否在微信环境中
 */
export function isWeixin(): boolean {
    const ua = getUserAgent();
    return /micromessenger/i.test(ua);
}

/**
 * 检测是否在支付宝环境中
 */
export function isAlipay(): boolean {
    const ua = getUserAgent();
    return /alipay/i.test(ua);
}

/**
 * 检测是否在百度环境中
 */
export function isBaidu(): boolean {
    const ua = getUserAgent();
    return /baiduboxapp|swan/i.test(ua);
}

/**
 * 检测是否在头条环境中
 */
export function isToutiao(): boolean {
    const ua = getUserAgent();
    return /toutiao/i.test(ua);
}

/**
 * 检测是否在 QQ 环境中
 */
export function isQQ(): boolean {
    const ua = getUserAgent();
    return /\sqq/i.test(ua);
}

/**
 * 检测是否在快手环境中
 */
export function isKuaishou(): boolean {
    const ua = getUserAgent();
    return /kuaishou/i.test(ua);
}

// ==================== 主要 API ====================

let cachedEnv: EnvDetectResult | null = null;

/**
 * 检测当前运行时环境(基于 User Agent)
 * 
 * 注意:
 * - 只能判断是否在某个 App 环境中
 * - 无法区分是小程序 web-view 还是内置浏览器
 * - 如需精确判断,请引入 SDK 后使用 checkMiniProgram 方法
 */
export function detectEnv(): EnvDetectResult {
    // 返回缓存结果
    if (cachedEnv) {
        return cachedEnv;
    }

    const ua = getUserAgent();
    let env: RuntimeEnv = RuntimeEnv.UNKNOWN;

    if (isWeixin()) {
        env = RuntimeEnv.WEIXIN;
    } else if (isAlipay()) {
        env = RuntimeEnv.ALIPAY;
    } else if (isBaidu()) {
        env = RuntimeEnv.BAIDU;
    } else if (isToutiao()) {
        env = RuntimeEnv.TOUTIAO;
    } else if (isQQ()) {
        env = RuntimeEnv.QQ;
    } else if (isKuaishou()) {
        env = RuntimeEnv.KUAISHOU;
    } else {
        env = RuntimeEnv.BROWSER;
    }

    const result: EnvDetectResult = {
        env,
        isInWeixin: isWeixin(),
        isInAlipay: isAlipay(),
        isInBrowser: env === RuntimeEnv.BROWSER,
        userAgent: ua,
    };

    // 缓存结果
    cachedEnv = result;

    return result;
}

/**
 * 清除缓存的环境检测结果
 */
export function clearEnvCache(): void {
    cachedEnv = null;
}

// ==================== SDK 加载与精确检测 ====================

/**
 * 动态加载脚本
 */
function loadScript(src: string, timeout = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';

        const timer = setTimeout(() => {
            reject(new Error(`加载 SDK 超时: ${src}`));
        }, timeout);

        script.onload = () => {
            clearTimeout(timer);
            resolve();
        };

        script.onerror = () => {
            clearTimeout(timer);
            reject(new Error(`加载 SDK 失败: ${src}`));
        };

        document.head.appendChild(script);
    });
}

/**
 * 加载微信 JSSDK
 */
export async function loadWeixinSDK(url = 'https://res.wx.qq.com/open/js/jweixin-1.3.2.js'): Promise<void> {
    if (typeof (window as any).wx !== 'undefined') {
        return; // 已加载
    }
    await loadScript(url);
}

/**
 * 加载支付宝 SDK
 */
export async function loadAlipaySDK(url = 'https://appx/web-view.min.js'): Promise<void> {
    if (typeof (window as any).my !== 'undefined') {
        return; // 已加载
    }
    await loadScript(url);
}

/**
 * 检测是否在微信小程序 web-view 中
 * 需要先调用 loadWeixinSDK() 加载 SDK
 */
export function checkWeixinMiniProgram(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if (typeof (window as any).wx === 'undefined') {
            reject(new Error('微信 SDK 未加载,请先调用 loadWeixinSDK()'));
            return;
        }

        const wx = (window as any).wx;
        if (!wx.miniProgram || typeof wx.miniProgram.getEnv !== 'function') {
            resolve(false);
            return;
        }

        wx.miniProgram.getEnv((res: any) => {
            resolve(res.miniprogram === true);
        });
    });
}

/**
 * 检测是否在支付宝小程序 web-view 中
 * 需要先调用 loadAlipaySDK() 加载 SDK
 */
export function checkAlipayMiniProgram(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if (typeof (window as any).my === 'undefined') {
            reject(new Error('支付宝 SDK 未加载,请先调用 loadAlipaySDK()'));
            return;
        }

        const my = (window as any).my;
        if (typeof my.getEnv !== 'function') {
            resolve(false);
            return;
        }

        my.getEnv((res: any) => {
            resolve(res.miniprogram === true);
        });
    });
}

/**
 * 自动检测并加载对应 SDK,然后判断是否在小程序中
 * 
 * 使用示例:
 * ```typescript
 * const result = await autoDetectMiniProgram();
 * if (result.isMiniProgram) {
 *   console.log('在小程序中:', result.platform);
 * }
 * ```
 */
export async function autoDetectMiniProgram(config?: SDKConfig): Promise<{
    isMiniProgram: boolean;
    platform: 'weixin' | 'alipay' | 'unknown';
    error?: Error;
}> {
    const env = detectEnv();

    try {
        if (env.isInWeixin) {
            // 加载微信 SDK
            await loadWeixinSDK(config?.weixinSDK);
            const isMiniProgram = await checkWeixinMiniProgram();
            return { isMiniProgram, platform: 'weixin' };
        } else if (env.isInAlipay) {
            // 加载支付宝 SDK
            await loadAlipaySDK(config?.alipaySDK);
            const isMiniProgram = await checkAlipayMiniProgram();
            return { isMiniProgram, platform: 'alipay' };
        } else {
            return { isMiniProgram: false, platform: 'unknown' };
        }
    } catch (error) {
        return {
            isMiniProgram: false,
            platform: 'unknown',
            error: error as Error,
        };
    }
}

// ==================== 便捷方法 ====================

/**
 * 获取当前环境类型
 */
export function getCurrentEnv(): RuntimeEnv {
    const result = detectEnv();
    return result.env;
}

// ==================== 默认导出 ====================

export default {
    // 环境检测
    detectEnv,
    clearEnvCache,
    getCurrentEnv,

    // 平台判断
    isWeixin,
    isAlipay,
    isBaidu,
    isToutiao,
    isQQ,
    isKuaishou,

    // SDK 加载
    loadWeixinSDK,
    loadAlipaySDK,

    // 小程序检测
    checkWeixinMiniProgram,
    checkAlipayMiniProgram,
    autoDetectMiniProgram,

    // 枚举
    RuntimeEnv,
};
