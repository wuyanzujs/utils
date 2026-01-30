/**
 * 路由守卫管理
 * 提供路由守卫的添加、移除和执行功能
 */

/** 路由守卫函数 */
export type RouteGuard = (to: string, from: string, params?: Record<string, any>) => boolean | Promise<boolean>;

/** 全局配置 */
interface RouterConfig {
    /** 路由守卫列表 */
    guards: RouteGuard[];
    /** 是否启用跳转日志 */
    enableLog: boolean;
    /** 跳转历史记录 */
    history: string[];
    /** 最大历史记录数 */
    maxHistorySize: number;
}

const config: RouterConfig = {
    guards: [],
    enableLog: false,
    history: [],
    maxHistorySize: 50,
};

/**
 * 添加路由守卫
 */
export function addGuard(guard: RouteGuard): void {
    config.guards.push(guard);
    log('添加路由守卫');
}

/**
 * 移除路由守卫
 */
export function removeGuard(guard: RouteGuard): void {
    const index = config.guards.indexOf(guard);
    if (index > -1) {
        config.guards.splice(index, 1);
        log('移除路由守卫');
    }
}

/**
 * 清空所有路由守卫
 */
export function clearGuards(): void {
    config.guards = [];
    log('清空所有路由守卫');
}

/**
 * 设置日志开关
 */
export function setLogEnabled(enabled: boolean): void {
    config.enableLog = enabled;
}

/**
 * 获取跳转历史
 */
export function getHistory(): string[] {
    return [...config.history];
}

/**
 * 清空跳转历史
 */
export function clearHistory(): void {
    config.history = [];
    log('清空跳转历史');
}

// ==================== 内部方法(供其他模块使用) ====================

/**
 * 日志输出
 */
export function log(message: string, data?: any): void {
    if (config.enableLog) {
        console.log(`[Router] ${message}`, data || '');
    }
}

/**
 * 执行路由守卫
 */
export async function executeGuards(to: string, from: string, params?: Record<string, any>): Promise<boolean> {
    for (const guard of config.guards) {
        try {
            const result = await guard(to, from, params);
            if (!result) {
                log(`路由守卫拦截: ${from} -> ${to}`);
                return false;
            }
        } catch (error) {
            console.error('[Router] 路由守卫执行错误:', error);
            return false;
        }
    }
    return true;
}

/**
 * 记录跳转历史
 */
export function recordHistory(url: string): void {
    config.history.push(url);
    if (config.history.length > config.maxHistorySize) {
        config.history.shift();
    }
}
