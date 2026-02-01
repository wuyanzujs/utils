/**
 * UniApp 统一存储工具
 * 
 * 提供跨平台的存储 API，支持:
 * - 基础的 get/set/remove/clear 操作
 * - 类型安全
 * - 同步/异步 API
 * - 内存缓存加速
 * 
 * @example
 * ```typescript
 * import { storage } from '@/utils/storage';
 * 
 * // 基础用法
 * storage.set('user', { name: 'Alice', age: 18 });
 * const user = storage.get<{ name: string; age: number }>('user');
 * 
 * // 异步操作
 * await storage.setAsync('config', { theme: 'dark' });
 * const config = await storage.getAsync('config');
 * 
 * // 预加载常用 key
 * storage.preload(['user', 'token', 'config']);
 * ```
 */

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 存储信息
 */
interface StorageInfo {
    keys: string[];
    currentSize: number;
    limitSize: number;
}

/**
 * 异步操作回调
 */
interface AsyncCallback<T> {
    success?: (res: T) => void;
    fail?: (err: any) => void;
    complete?: () => void;
}

/**
 * 缓存统计信息
 */
interface CacheStats {
    hits: number;
    misses: number;
    size: number;
}

// ============================================================================
// 内存缓存层
// ============================================================================

/** 内存缓存 */
const cache = new Map<string, any>();

/** 缓存统计 */
const stats = { hits: 0, misses: 0 };

// ============================================================================
// 同步 API
// ============================================================================

/**
 * 同步获取存储值
 * @param key 存储键名
 * @param defaultValue 默认值（当键不存在或解析失败时返回）
 * @returns 存储的值或默认值
 */
function get<T>(key: string, defaultValue?: T): T | null {
    // 优先从缓存读取
    if (cache.has(key)) {
        stats.hits++;
        return cache.get(key) as T;
    }

    stats.misses++;
    try {
        const data = uni.getStorageSync(key);
        if (data === '' || data === undefined || data === null) {
            return defaultValue ?? null;
        }
        // 存入缓存
        cache.set(key, data);
        return data as T;
    } catch (error) {
        console.error(`[Storage] 获取 ${key} 失败:`, error);
        return defaultValue ?? null;
    }
}

/**
 * 同步设置存储值
 * @param key 存储键名
 * @param value 要存储的值
 * @returns 是否成功
 */
function set(key: string, value: any): boolean {
    try {
        uni.setStorageSync(key, value);
        // 同步更新缓存
        cache.set(key, value);
        return true;
    } catch (error) {
        console.error(`[Storage] 设置 ${key} 失败:`, error);
        return false;
    }
}

/**
 * 同步删除存储值
 * @param key 存储键名
 * @returns 是否成功
 */
function remove(key: string): boolean {
    try {
        uni.removeStorageSync(key);
        // 同步清除缓存
        cache.delete(key);
        return true;
    } catch (error) {
        console.error(`[Storage] 删除 ${key} 失败:`, error);
        return false;
    }
}

/**
 * 同步清空所有存储
 * @returns 是否成功
 */
function clear(): boolean {
    try {
        uni.clearStorageSync();
        // 清空缓存
        cache.clear();
        stats.hits = 0;
        stats.misses = 0;
        return true;
    } catch (error) {
        console.error('[Storage] 清空存储失败:', error);
        return false;
    }
}

/**
 * 同步获取存储信息
 * @returns 存储信息
 */
function getInfo(): StorageInfo {
    try {
        const info = uni.getStorageInfoSync();
        return {
            keys: info.keys,
            currentSize: info.currentSize,
            limitSize: info.limitSize,
        };
    } catch (error) {
        console.error('[Storage] 获取存储信息失败:', error);
        return { keys: [], currentSize: 0, limitSize: 0 };
    }
}

/**
 * 检查键是否存在
 * @param key 存储键名
 * @returns 是否存在
 */
function has(key: string): boolean {
    try {
        const data = uni.getStorageSync(key);
        return data !== '' && data !== undefined && data !== null;
    } catch {
        return false;
    }
}

// ============================================================================
// 异步 API
// ============================================================================

/**
 * 异步获取存储值
 * @param key 存储键名
 * @returns Promise<T | null>
 */
function getAsync<T>(key: string): Promise<T | null> {
    return new Promise((resolve) => {
        uni.getStorage({
            key,
            success: (res) => {
                resolve(res.data as T);
            },
            fail: () => {
                resolve(null);
            },
        });
    });
}

/**
 * 异步设置存储值
 * @param key 存储键名
 * @param value 要存储的值
 * @returns Promise<boolean>
 */
function setAsync(key: string, value: any): Promise<boolean> {
    return new Promise((resolve) => {
        uni.setStorage({
            key,
            data: value,
            success: () => {
                resolve(true);
            },
            fail: (error) => {
                console.error(`[Storage] 异步设置 ${key} 失败:`, error);
                resolve(false);
            },
        });
    });
}

/**
 * 异步删除存储值
 * @param key 存储键名
 * @returns Promise<boolean>
 */
function removeAsync(key: string): Promise<boolean> {
    return new Promise((resolve) => {
        uni.removeStorage({
            key,
            success: () => {
                resolve(true);
            },
            fail: (error) => {
                console.error(`[Storage] 异步删除 ${key} 失败:`, error);
                resolve(false);
            },
        });
    });
}

/**
 * 异步清空所有存储
 * @returns Promise<boolean>
 */
function clearAsync(): Promise<boolean> {
    return new Promise((resolve) => {
        uni.clearStorage({
            success: () => {
                resolve(true);
            },
            fail: (error) => {
                console.error('[Storage] 异步清空存储失败:', error);
                resolve(false);
            },
        });
    });
}

/**
 * 异步获取存储信息
 * @returns Promise<StorageInfo>
 */
function getInfoAsync(): Promise<StorageInfo> {
    return new Promise((resolve) => {
        uni.getStorageInfo({
            success: (res) => {
                resolve({
                    keys: res.keys,
                    currentSize: res.currentSize,
                    limitSize: res.limitSize,
                });
            },
            fail: () => {
                resolve({ keys: [], currentSize: 0, limitSize: 0 });
            },
        });
    });
}

// ============================================================================
// 批量操作
// ============================================================================

/**
 * 批量获取存储值
 * @param keys 键名数组
 * @returns 键值对对象
 */
function getMultiple<T extends Record<string, any>>(keys: (keyof T)[]): Partial<T> {
    const result: Partial<T> = {};
    for (const key of keys) {
        result[key] = get<T[typeof key]>(key as string) ?? undefined;
    }
    return result;
}

/**
 * 批量设置存储值
 * @param data 键值对对象
 * @returns 是否全部成功
 */
function setMultiple(data: Record<string, any>): boolean {
    let allSuccess = true;
    for (const [key, value] of Object.entries(data)) {
        if (!set(key, value)) {
            allSuccess = false;
        }
    }
    return allSuccess;
}

/**
 * 批量删除存储值
 * @param keys 键名数组
 * @returns 是否全部成功
 */
function removeMultiple(keys: string[]): boolean {
    let allSuccess = true;
    for (const key of keys) {
        if (!remove(key)) {
            allSuccess = false;
        }
    }
    return allSuccess;
}

// ============================================================================
// 对象深层操作
// ============================================================================

/**
 * 获取对象中的嵌套属性
 * @param key 存储键名
 * @param path 属性路径(如 'user.profile.name')
 * @param defaultValue 默认值
 * @returns 属性值
 */
function getPath<T>(key: string, path: string, defaultValue?: T): T | null {
    const data = get<Record<string, any>>(key);
    if (!data) return defaultValue ?? null;

    const keys = path.split('.');
    let current: any = data;

    for (const k of keys) {
        if (current === null || current === undefined || typeof current !== 'object') {
            return defaultValue ?? null;
        }
        current = current[k];
    }

    return (current as T) ?? defaultValue ?? null;
}

/**
 * 设置对象中的嵌套属性
 * @param key 存储键名
 * @param path 属性路径(如 'user.profile.name')
 * @param value 要设置的值
 * @returns 是否成功
 */
function setPath(key: string, path: string, value: any): boolean {
    let data = get<Record<string, any>>(key) || {};

    const keys = path.split('.');
    let current = data;

    for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in current) || typeof current[k] !== 'object') {
            current[k] = {};
        }
        current = current[k];
    }

    current[keys[keys.length - 1]] = value;
    return set(key, data);
}

// ============================================================================
// 缓存管理 API
// ============================================================================

/**
 * 预加载常用 key 到内存缓存
 * @param keys 要预加载的键名数组
 * @returns 成功加载的数量
 */
function preload(keys: string[]): number {
    let loadedCount = 0;
    for (const key of keys) {
        if (!cache.has(key)) {
            try {
                const data = uni.getStorageSync(key);
                if (data !== '' && data !== undefined && data !== null) {
                    cache.set(key, data);
                    loadedCount++;
                }
            } catch {
                // 忽略加载失败的 key
            }
        }
    }
    return loadedCount;
}

/**
 * 使指定 key 的缓存失效（下次 get 时重新从底层读取）
 * @param key 要失效的键名，不传则清空所有缓存
 */
function invalidate(key?: string): void {
    if (key) {
        cache.delete(key);
    } else {
        cache.clear();
    }
}

/**
 * 获取缓存统计信息
 * @returns 缓存统计
 */
function getCacheStats(): CacheStats {
    return {
        hits: stats.hits,
        misses: stats.misses,
        size: cache.size,
    };
}

// ============================================================================
// 导出
// ============================================================================

export const storage = {
    // 同步 API
    get,
    set,
    remove,
    clear,
    getInfo,
    has,

    // 异步 API
    getAsync,
    setAsync,
    removeAsync,
    clearAsync,
    getInfoAsync,

    // 批量操作
    getMultiple,
    setMultiple,
    removeMultiple,

    // 对象深层操作
    getPath,
    setPath,

    // 缓存管理 API
    preload,
    invalidate,
    getCacheStats,
};

// 类型导出
export type { StorageInfo, AsyncCallback, CacheStats };

// 默认导出
export default storage;
