# UniApp 路由工具库

一套完整的 uniapp 路由跳转工具函数库,兼容小程序和 H5,提供类型安全、路由守卫、历史记录等功能。

## 📁 项目结构

```
utils/
├── index.ts          # 统一导出文件
├── router.ts         # 路由跳转核心功能
├── guards.ts         # 路由守卫管理
├── page.ts           # 页面栈管理
├── platform.ts       # 平台判断(编译时)
├── runtime-env.ts    # 运行时环境检测(H5)
└── internal.ts       # 内部工具函数
```

## 🚀 快速开始

### 基础使用

```typescript
import router from '@/utils';

// 1. 页面跳转
router.navigateTo('/pages/detail/index', { id: 123 });

// 2. 平台判断
if (router.IS_H5) {
  console.log('H5 环境');
}

// 3. 路由守卫
router.addGuard(async (to, from) => {
  // 验证逻辑
  return true;
});
```

### 按需导入

```typescript
// 只导入需要的功能
import { navigateTo, IS_H5, addGuard } from '@/utils';

navigateTo('/pages/home/index');
```

## 📦 模块说明

### 1. router.ts - 路由跳转

提供统一的页面跳转 API。

```typescript
import { navigateTo, redirectTo, reLaunch, switchTab, navigateBack } from '@/utils';

// 打开新页面
navigateTo('/pages/detail/index', { id: 123 });

// 重定向
redirectTo('/pages/login/index');

// 重启应用
reLaunch('/pages/home/index');

// 切换 Tab
switchTab('/pages/home/index');

// 返回
navigateBack();
navigateBack({ delta: 2 });

// 返回到指定页面
navigateBackTo('/pages/home/index');
```

### 2. guards.ts - 路由守卫

管理路由守卫和历史记录。

```typescript
import { addGuard, removeGuard, clearGuards, setLogEnabled } from '@/utils';

// 添加登录守卫
const loginGuard = async (to, from, params) => {
  if (to.includes('/pages/user/')) {
    const token = uni.getStorageSync('token');
    if (!token) {
      navigateTo('/pages/login/index');
      return false;
    }
  }
  return true;
};

addGuard(loginGuard);

// 启用日志
setLogEnabled(true);

// 获取历史记录
const history = getHistory();
```

### 3. page.ts - 页面栈管理

提供页面栈相关的查询功能。

```typescript
import { getCurrentPath, getPageStack, canGoBack, parseUrlParams } from '@/utils';

// 获取当前路径
const path = getCurrentPath();

// 获取页面栈
const stack = getPageStack();

// 判断是否可以返回
if (canGoBack()) {
  navigateBack();
}

// 解析 URL 参数
const params = parseUrlParams('/pages/detail?id=123&name=test');
```

### 4. platform.ts - 平台判断(编译时)

在打包时确定平台类型,零运行时开销。

```typescript
import { IS_H5, IS_MP, IS_APP, CURRENT_PLATFORM, PlatformType } from '@/utils';

// 推荐:直接使用常量
if (IS_H5) {
  console.log('H5 环境');
}

if (IS_MP) {
  console.log('小程序环境');
}

// 获取具体平台
switch (CURRENT_PLATFORM) {
  case PlatformType.H5:
    console.log('H5');
    break;
  case PlatformType.MP_WEIXIN:
    console.log('微信小程序');
    break;
}
```

### 5. runtime-env.ts - 运行时环境检测

用于 H5 页面判断当前运行在哪个宿主环境中。

```typescript
import { detectEnv, autoDetectMiniProgram } from '@/utils/runtime-env';

// 基础检测(基于 User Agent)
const env = detectEnv();
if (env.isInWeixin) {
  console.log('在微信中');
}

// 精确检测(需要加载 SDK)
const result = await autoDetectMiniProgram();
if (result.isMiniProgram) {
  console.log(`在 ${result.platform} 小程序 web-view 中`);
}
```

## 💡 实战示例

### 示例 1: 完整的路由配置

```typescript
// app.ts 或 main.ts
import router from '@/utils';

// 启用日志
router.setLogEnabled(true);

// 添加登录守卫
router.addGuard(async (to, from, params) => {
  const needAuth = ['/pages/user/', '/pages/order/', '/pages/cart/'];
  
  if (needAuth.some(path => to.includes(path))) {
    const token = uni.getStorageSync('token');
    if (!token) {
      router.navigateTo('/pages/login/index', {
        redirect: to,
        ...params
      });
      return false;
    }
  }
  
  return true;
});

// 添加权限守卫
router.addGuard(async (to, from) => {
  if (to.includes('/pages/admin/')) {
    const userInfo = uni.getStorageSync('userInfo');
    if (userInfo?.role !== 'admin') {
      uni.showToast({ title: '无权限访问', icon: 'none' });
      return false;
    }
  }
  return true;
});
```

### 示例 2: 平台差异化处理

```typescript
import { IS_H5, IS_MP, CURRENT_PLATFORM, PlatformType } from '@/utils';

function share() {
  if (IS_H5) {
    // H5 使用 Web Share API
    if (navigator.share) {
      navigator.share({
        title: '分享标题',
        url: window.location.href
      });
    }
  } else if (IS_MP) {
    // 小程序使用原生分享
    uni.showShareMenu({
      withShareTicket: true
    });
  }
}

function pay(amount: number) {
  switch (CURRENT_PLATFORM) {
    case PlatformType.MP_WEIXIN:
      // 微信支付
      break;
    case PlatformType.MP_ALIPAY:
      // 支付宝支付
      break;
    case PlatformType.H5:
      // H5 支付
      break;
  }
}
```

### 示例 3: H5 环境检测

```typescript
// H5 页面中
import { autoDetectMiniProgram } from '@/utils/runtime-env';

async function init() {
  const result = await autoDetectMiniProgram();
  
  if (result.isMiniProgram) {
    // 在小程序 web-view 中
    console.log(`在 ${result.platform} 小程序中`);
    
    // 隐藏导航栏
    document.body.classList.add('in-miniprogram');
    
    // 使用小程序 API
    if (result.platform === 'weixin') {
      window.wx.miniProgram.postMessage({ data: 'hello' });
    }
  } else {
    // 在普通浏览器中
    console.log('在浏览器中');
  }
}

init();
```

## 🎯 使用场景对比

| 场景 | 使用模块 | 判断时机 | 示例 |
|------|---------|---------|------|
| uniapp 小程序代码 | `platform.ts` | 编译时 | `if (IS_MP) { ... }` |
| uniapp H5 代码 | `platform.ts` | 编译时 | `if (IS_H5) { ... }` |
| H5 在 web-view 中 | `runtime-env.ts` | 运行时 | `await autoDetectMiniProgram()` |
| 页面跳转 | `router.ts` | 运行时 | `navigateTo('/path')` |
| 路由拦截 | `guards.ts` | 运行时 | `addGuard(...)` |

## 📝 API 文档

### 路由跳转

- `navigateTo(url, params?)` - 打开新页面
- `redirectTo(url, params?)` - 重定向
- `reLaunch(url, params?)` - 重启应用
- `switchTab(url)` - 切换 Tab
- `navigateBack(options?)` - 返回上一页
- `navigateBackTo(url)` - 返回到指定页面

### 路由守卫

- `addGuard(guard)` - 添加守卫
- `removeGuard(guard)` - 移除守卫
- `clearGuards()` - 清空所有守卫
- `setLogEnabled(enabled)` - 设置日志开关
- `getHistory()` - 获取历史记录
- `clearHistory()` - 清空历史记录

### 页面栈

- `getCurrentPath()` - 获取当前路径
- `getPageStack()` - 获取页面栈
- `canGoBack()` - 判断是否可以返回
- `parseUrlParams(url)` - 解析 URL 参数

### 平台判断

- `IS_H5` - 是否为 H5(常量)
- `IS_MP` - 是否为小程序(常量)
- `IS_APP` - 是否为 App(常量)
- `CURRENT_PLATFORM` - 当前平台类型(常量)
- `platform.isH5()` - 是否为 H5(函数)
- `platform.isWeixin()` - 是否为微信小程序(函数)

### 运行时环境检测

- `detectEnv()` - 检测环境(基于 UA)
- `autoDetectMiniProgram()` - 自动检测小程序
- `loadWeixinSDK()` - 加载微信 SDK
- `loadAlipaySDK()` - 加载支付宝 SDK
- `checkWeixinMiniProgram()` - 检测微信小程序
- `checkAlipayMiniProgram()` - 检测支付宝小程序

## ⚠️ 注意事项

1. **switchTab 不支持传参**: 由于 uniapp 限制,`switchTab` 无法传递参数
2. **路由守卫是异步的**: 守卫函数可以返回 Promise
3. **平台常量推荐用法**: 优先使用 `IS_H5`、`IS_MP` 等常量,性能更好
4. **H5 需要引入 SDK**: 在小程序 web-view 中使用小程序 API 需要手动引入 SDK

## 📄 License

MIT
