# PRD：登录注册与节点自动注入功能

**项目**：Clash Verge Rev 二次开发
**版本**：v1.0
**日期**：2026-05-14

---

## 1. 概述

### 1.1 项目背景
在 Clash Verge Rev 现有功能基础上，新增用户登录注册功能。用户登录成功后，从后端 API 获取节点列表，自动注入为本地 Profile，用户手动选择节点后开启代理服务。

### 1.2 核心流程

```
启动应用
  ├─ localStorage 有 auth_user_id？
  │   ├─ 有 → 调用 getNodeList → 解析节点 → 创建 Profile → 跳转 Home
  │   └─ 无 → 跳转 /login
  │
登录页面 → 用户输入用户名/密码 → POST /api/login
  ├─ 成功 → 存储 UserID → 调用 getNodeList → 解析节点 → 创建 Profile → 跳转 Home
  └─ 失败 → 显示错误信息
```

---

## 2. 后端 API 对接

### 2.1 API 信息

| 项目 | 值 |
|------|-----|
| 域名 | `https://vdev.dv333.online` |
| 传输协议 | HTTPS |
| 认证方式 | UserID 传参（无 Token / 无 Session） |

### 2.2 登录接口

| 项目 | 值 |
|------|-----|
| 路由 | `POST /api/login` |
| Content-Type | `application/json` |

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名（邮箱或手机号） |
| password | string | 是 | 密码 |
| DeviceIMEI | string | 否 | 设备 IMEI（用于设备绑定） |

**成功响应**：
```json
{
  "status": "success",
  "message": "登录成功",
  "data": {
    "id": 1,
    "status": 1,
    "class": 0,
    "level": 0,
    "expire_in": "2026-12-31",
    "invite_code": "10001",
    "link": "http://example.com/s/abc123",
    "usedTraffic": "10.5MB",
    "Traffic": "100GB",
    "vip_type": "svip",
    "nodes": []
  }
}
```

**失败响应**：
```json
{
  "status": "fail",
  "message": "用户名或密码错误",
  "data": []
}
```

### 2.3 获取节点列表接口

| 项目 | 值 |
|------|-----|
| 路由 | `POST /api/getNodeList` |
| Content-Type | `application/json` |

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| UserID | int | 是 | 用户ID（登录后从响应中获取） |

**成功响应**：
```json
{
  "status": "success",
  "data": [
    {
      "country_code": "US",
      "country_name": "美国",
      "country_flag": "/assets/images/country/us.png",
      "nodes": [
        {
          "name": "美国-01",
          "server": "us.example.com",
          "server_port": "443",
          "password": "xxx",
          "method": "aes-256-gcm",
          "obfs": "websocket",
          "obfsparam": "xxx",
          "protocol": "auth_aes128_sha1",
          "protocolparam": "port:passwd",
          "single": 1,
          "flags": "https://example.com/flags/us.png",
          "group": "VIP",
          "vip_type": "svip",
          "is_default": 1
        }
      ]
    }
  ]
}
```

---

## 3. 功能需求

### 3.1 登录模块

| 功能 | 描述 | 实现方式 |
|------|------|----------|
| 登录入口 | 未登录时显示全屏登录页 | 路由守卫 |
| 登录方式 | 用户名 + 密码 | POST /api/login |
| UserID 存储 | 登录成功后存储 UserID | localStorage |
| 自动登录 | 启动时检查 UserID，有效则自动登录 | App 启动时检查 |
| 记住登录 | 关闭应用后重新打开，保持登录状态 | localStorage 持久化 |

### 3.2 节点获取与转换

| 功能 | 描述 |
|------|------|
| 获取节点 | 登录后调用 getNodeList(UserID) 获取节点列表 |
| 分组展示 | 按国家分组，国旗 + 国家名称 |
| 节点详情 | 显示节点名称、国旗、VIP图标、分组名 |
| 延迟测速 | 支持节点延迟测速显示 |

### 3.3 节点 → Clash YAML 转换

**转换规则**：

| 节点字段 | Clash proxies 字段 | 说明 |
|----------|-------------------|------|
| name | name | 节点名称 |
| server | server | 服务器地址 |
| server_port | port | 端口号 |
| password | password | 密码 |
| method | cipher | 加密方式 |
| protocol | protocol | 协议 |
| obfs | obfs | 混淆 |
| obfsparam | obfs-param | 混淆参数 |
| protocolparam | protocol-param | 协议参数 |

**单端口模式判断**：
- `single == 1`：使用节点的 `server_port`、`password`、`protocol` 配置
- `single != 1`：使用用户账号的端口/密码/协议配置（后端应已处理）

**输出 YAML 结构**：
```yaml
proxies:
  - name: "美国-01"
    type: ss
    server: "us.example.com"
    port: 443
    cipher: aes-256-gcm
    password: "xxx"
    obfs: websocket
    obfs-param: "xxx"
    protocol: auth_aes128_sha1
    protocol-param: "port:passwd"

proxy-groups:
  - name: "美国 (US)"
    type: select
    proxies:
      - "美国-01"
```

### 3.4 Profile 管理

| 功能 | 描述 |
|------|------|
| 创建 Profile | 登录成功后，将节点列表转为 YAML，创建类型为 `local` 的 Profile |
| 分组处理 | 每个国家分组创建一个 Proxy Group，节点作为该 Group 的子节点 |
| Profile 命名 | "我的节点列表-{timestamp}" |
| 自动激活 | 创建完成后自动切换到该 Profile |

### 3.5 退出登录

| 功能 | 描述 |
|------|------|
| 清除 UserID | `localStorage.removeItem('auth_user_id')` |
| 清除节点 | 删除该账号导入的所有节点 Profile |
| 跳转登录页 | 返回登录界面 |

---

## 4. UI/UX 设计

### 4.1 登录页

```
┌─────────────────────────────────────┐
│                                     │
│           [APP LOGO]                │
│         Clash Verge Rev             │
│                                     │
│    ┌───────────────────────────┐   │
│    │  用户名 / 邮箱 / 手机       │   │
│    └───────────────────────────┘   │
│    ┌───────────────────────────┐   │
│    │  密码                    │   │
│    └───────────────────────────┘   │
│                                     │
│    ┌───────────────────────────┐   │
│    │         登 录             │   │
│    └───────────────────────────┘   │
│                                     │
│         还没有账号？去注册           │
│                                     │
└─────────────────────────────────────┘
```

### 4.2 代理选择页（节点分组）

```
┌─────────────────────────────────────┐
│ ◀ 返回        选择节点          ⋮  │
├─────────────────────────────────────┤
│ 🔍 搜索节点...                       │
├─────────────────────────────────────┤
│ ▼ 🇺🇸 美国 (US)                 12  │
│   ├── 🇺🇸 美国-01  ⭐SVIP  VIP    │
│   ├── 🇺🇸 美国-02  ⭐SVIP  VIP    │
│   └── 🇺🇸 美国-03  ⭐SVIP  VIP    │
├─────────────────────────────────────┤
│ ▼ 🇭🇰 香港 (HK)                   8  │
│   ├── 🇭🇰 香港-01  ⭐SVIP  VIP    │
│   └── ...                           │
├─────────────────────────────────────┤
│ ▼ 🇯🇵 日本 (JP)                   15  │
│   └── ...                           │
└─────────────────────────────────────┘
```

### 4.3 交互流程

| 步骤 | 操作 | 结果 |
|------|------|------|
| 1 | 打开应用 | 检查 localStorage 是否有 auth_user_id |
| 2a | 有 UserID | 调用 getNodeList → 创建 Profile → 跳转 Home |
| 2b | 无 UserID | 显示登录页 |
| 3 | 输入用户名/密码点击登录 | 调用 /api/login |
| 4a | 登录成功 | 存储 UserID → 调用 getNodeList → 创建 Profile → 跳转 Home |
| 4b | 登录失败 | 显示错误信息 |
| 5 | 点击退出登录 | 确认弹窗 → 清除 UserID 和 Profile → 跳转登录页 |

---

## 5. 技术方案

### 5.1 项目结构改动

#### 5.1.1 新增文件

| 文件路径 | 用途 |
|----------|------|
| `src/services/auth.ts` | 登录、登出、API 调用封装 |
| `src/hooks/use-auth.ts` | 认证状态 Hook |
| `src/utils/node-converter.ts` | 节点 JSON → Clash YAML 转换器 |
| `src/pages/login.tsx` | 登录页面组件 |
| `src/components/login/LoginForm.tsx` | 登录表单组件 |

#### 5.1.2 修改文件

| 文件路径 | 改动内容 |
|----------|----------|
| `src/pages/_routers.tsx` | 添加路由守卫 |
| `src/providers/app-data-context.tsx` | 集成认证状态 |
| `src/services/cmds.ts` | 复用 createProfile |
| `src/locales/zh/index.ts` | 添加中文文案 |
| `src/locales/en/index.ts` | 添加英文文案 |

### 5.2 核心实现

#### 5.2.1 auth.ts

```typescript
// src/services/auth.ts

const API_BASE = 'https://vdev.dv333.online'

interface LoginRequest {
  username: string
  password: string
  DeviceIMEI?: string
}

interface LoginResponse {
  status: 'success' | 'fail'
  message: string
  data: {
    id: number
    nodes: any[]
    // ... 其他用户信息
  }
}

export const auth = {
  login: async (params: LoginRequest): Promise<LoginResponse> => {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })
    return res.json()
  },

  getNodeList: async (userId: number): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/getNodeList`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ UserID: userId })
    })
    return res.json()
  },

  saveUserId: (id: number) => {
    localStorage.setItem('auth_user_id', String(id))
  },

  getUserId: (): number | null => {
    const id = localStorage.getItem('auth_user_id')
    return id ? Number(id) : null
  },

  clearAuth: () => {
    localStorage.removeItem('auth_user_id')
  }
}
```

#### 5.2.2 node-converter.ts

```typescript
// src/utils/node-converter.ts

interface NodeItem {
  name: string
  server: string
  server_port: string
  password: string
  method: string
  obfs?: string
  obfsparam?: string
  protocol?: string
  protocolparam?: string
  single: number
}

interface CountryGroup {
  country_code: string
  country_name: string
  country_flag: string
  nodes: NodeItem[]
}

export function convertToClashYaml(countries: CountryGroup[]): string {
  const proxies: any[] = []
  const proxyGroups: any[] = []

  for (const country of countries) {
    const groupName = `${country.country_name} (${country.country_code})`
    const nodeNames: string[] = []

    for (const node of country.nodes) {
      const proxy: any = {
        name: node.name,
        type: 'ss',  // 默认 SS，根据实际扩展
        server: node.server,
        port: Number(node.server_port),
        cipher: node.method,
        password: node.password
      }

      if (node.obfs && node.obfs !== 'none') {
        proxy.obfs = node.obfs
        if (node.obfsparam) proxy['obfs-param'] = node.obfsparam
      }

      if (node.protocol && node.protocol !== 'origin') {
        proxy.protocol = node.protocol
        if (node.protocolparam) proxy['protocol-param'] = node.protocolparam
      }

      proxies.push(proxy)
      nodeNames.push(node.name)
    }

    proxyGroups.push({
      name: groupName,
      type: 'select',
      proxies: nodeNames
    })
  }

  // 添加 GLOBAL 组
  const allGroupNames = proxyGroups.map(g => g.name)
  proxyGroups.unshift({
    name: 'GLOBAL',
    type: 'select',
    proxies: ['DIRECT', 'REJECT', ...allGroupNames]
  })

  return yaml.dump({ proxies, 'proxy-groups': proxyGroups }, { indent: 2 })
}
```

#### 5.2.3 use-auth.ts

```typescript
// src/hooks/use-auth.ts

import { useState, useEffect } from 'react'
import { auth } from '@/services/auth'

export function useAuth() {
  const [userId, setUserId] = useState<number | null>(() => auth.getUserId())
  const [isLoggedIn, setIsLoggedIn] = useState(!!userId)

  const login = async (username: string, password: string) => {
    const res = await auth.login({ username, password })
    if (res.status === 'success') {
      auth.saveUserId(res.data.id)
      setUserId(res.data.id)
      setIsLoggedIn(true)
      return { success: true }
    }
    return { success: false, message: res.message }
  }

  const logout = () => {
    auth.clearAuth()
    setUserId(null)
    setIsLoggedIn(false)
  }

  return { isLoggedIn, userId, login, logout }
}
```

### 5.3 路由守卫

```typescript
// src/pages/_routers.tsx

<Route path="/login" element={<LoginPage />} />
<Route path="/" element={
  isLoggedIn ? <Layout /> : <Navigate to="/login" replace />
}>
  <Route index element={<HomePage />} />
  {/* 其他路由 */}
</Route>
```

---

## 6. 错误处理

| 场景 | 处理方式 |
|------|----------|
| 登录失败 | 显示后端返回的 `message` |
| UserID 无效 | 清除 localStorage，跳转登录页 |
| getNodeList 失败 | 显示错误信息和重试按钮 |
| 网络错误 | 显示 "网络连接失败，请检查网络" |

---

## 7. 实现计划

| 阶段 | 任务 | 产出 |
|------|------|------|
| **Phase 1** | 创建 auth 服务和 use-auth Hook | `auth.ts`, `use-auth.ts` |
| **Phase 1** | 创建登录页面和表单组件 | `login.tsx`, `LoginForm.tsx` |
| **Phase 1** | 添加路由守卫 | `_routers.tsx` |
| **Phase 2** | 创建节点转换器 | `node-converter.ts` |
| **Phase 2** | 集成节点加载到 Profile | `app-data-context.tsx` |
| **Phase 3** | 退出登录 + Profile 清理 | `auth.ts` + `cmds.ts` |
| **Phase 4** | 国际化文案 | `locales/zh/`, `locales/en/` |
| **Phase 5** | 联调测试 | 全流程验证 |

---

## 8. 附录

### 8.1 localStorage Key 定义

| Key | 类型 | 说明 |
|-----|------|------|
| `auth_user_id` | string | 用户ID |

### 8.2 节点字段映射表

| 后端字段 | Clash YAML 字段 | 说明 |
|----------|-----------------|------|
| name | name | 节点名称 |
| server | server | 服务器地址 |
| server_port | port | 端口号（转 number） |
| password | password | 密码 |
| method | cipher | 加密方式 |
| obfs | obfs | 混淆方式 |
| obfsparam | obfs-param | 混淆参数 |
| protocol | protocol | 协议 |
| protocolparam | protocol-param | 协议参数 |

---

**文档状态**：已完成，待实现确认
**下一步**：开始 Phase 1 实现
