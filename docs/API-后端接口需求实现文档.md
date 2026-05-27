# 后端接口需求实现文档

**项目**：Clash Verge Rev 二次开发 - 登录注册与节点自动注入功能
**版本**：v1.0
**日期**：2026-05-27
**状态**：待后端实现确认

---

## 1. 概述

本文档描述了前端与后端 API 对接的具体需求，包括接口规范、请求参数、响应格式等。后端需实现两个核心接口供前端调用。

### 1.1 API 基础信息

| 项目 | 值 |
|------|-----|
| 域名 | `https://vdev.dv333.online` |
| 传输协议 | HTTPS |
| 认证方式 | UserID 传参认证（无 Token / 无 Session） |

---

## 2. 接口清单

| 序号 | 接口名称 | 路由 | 方法 | 描述 |
|------|---------|------|------|------|
| 1 | 登录接口 | `/api/login` | POST | 用户登录认证 |
| 2 | 获取节点列表接口 | `/api/getNodeList` | POST | 获取用户绑定的节点列表 |

---

## 3. 接口详细规范

### 3.1 登录接口

**路由**：`POST /api/login`
**Content-Type**：`application/json`

#### 3.1.1 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名（邮箱或手机号） |
| password | string | 是 | 密码 |
| DeviceIMEI | string | 否 | 设备 IMEI（用于设备绑定） |

#### 3.1.2 请求示例

```json
{
  "username": "user@example.com",
  "password": "123456",
  "DeviceIMEI": "1234567890"
}
```

#### 3.1.3 成功响应

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

#### 3.1.4 成功响应字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| status | string | 状态码，`success` 表示成功 |
| message | string | 响应消息 |
| data | object | 用户数据对象 |
| data.id | int | 用户ID（前端需存储此字段用于后续接口调用） |
| data.status | int | 用户状态 |
| data.class | int | 用户等级 |
| data.level | int | 用户级别 |
| data.expire_in | string | 过期时间，格式：YYYY-MM-DD |
| data.invite_code | string | 邀请码 |
| data.link | string | 邀请链接 |
| data.usedTraffic | string | 已使用流量 |
| data.Traffic | string | 总流量 |
| data.vip_type | string | VIP类型（如：svip, vip, 普通） |
| data.nodes | array | 用户节点列表（登录接口返回空数组，节点通过 getNodeList 获取） |

#### 3.1.5 失败响应

```json
{
  "status": "fail",
  "message": "用户名或密码错误",
  "data": []
}
```

#### 3.1.6 失败响应字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| status | string | 状态码，`fail` 表示失败 |
| message | string | 错误消息（前端直接展示给用户） |
| data | array | 空数组 |

---

### 3.2 获取节点列表接口

**路由**：`POST /api/getNodeList`
**Content-Type**：`application/json`

#### 3.2.1 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| UserID | int | 是 | 用户ID（登录成功后从登录接口响应中获取） |

#### 3.2.2 请求示例

```json
{
  "UserID": 1
}
```

#### 3.2.3 成功响应

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
    },
    {
      "country_code": "HK",
      "country_name": "香港",
      "country_flag": "/assets/images/country/hk.png",
      "nodes": [
        {
          "name": "香港-01",
          "server": "hk.example.com",
          "server_port": "443",
          "password": "xxx",
          "method": "aes-256-gcm",
          "obfs": "websocket",
          "obfsparam": "xxx",
          "protocol": "auth_aes128_sha1",
          "protocolparam": "port:passwd",
          "single": 0,
          "flags": "https://example.com/flags/hk.png",
          "group": "VIP",
          "vip_type": "svip",
          "is_default": 0
        }
      ]
    }
  ]
}
```

#### 3.2.4 成功响应字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| status | string | 状态码，`success` 表示成功 |
| data | array | 国家分组列表 |
| data[].country_code | string | 国家代码（如：US, HK, JP） |
| data[].country_name | string | 国家名称（如：美国、香港、日本） |
| data[].country_flag | string | 国旗图片路径 |
| data[].nodes | array | 该国家的节点列表 |
| data[].nodes[].name | string | 节点名称 |
| data[].nodes[].server | string | 服务器地址 |
| data[].nodes[].server_port | string | 服务器端口 |
| data[].nodes[].password | string | 连接密码 |
| data[].nodes[].method | string | 加密方式（如：aes-256-gcm） |
| data[].nodes[].obfs | string | 混淆方式（如：websocket, none） |
| data[].nodes[].obfsparam | string | 混淆参数 |
| data[].nodes[].protocol | string | 协议（如：auth_aes128_sha1, origin） |
| data[].nodes[].protocolparam | string | 协议参数 |
| data[].nodes[].single | int | 单端口模式标志（1：单端口模式，0：普通模式） |
| data[].nodes[].flags | string | 节点图标URL |
| data[].nodes[].group | string | 节点分组（如：VIP） |
| data[].nodes[].vip_type | string | VIP类型（如：svip, vip） |
| data[].nodes[].is_default | int | 是否默认节点（1：默认，0：非默认） |

#### 3.2.5 失败响应

```json
{
  "status": "fail",
  "data": []
}
```

---

## 4. Clash YAML 转换规则

前端将根据以下规则将后端返回的节点数据转换为 Clash 配置文件。

### 4.1 节点字段映射

| 后端字段 | Clash YAML 字段 | 说明 |
|----------|-----------------|------|
| name | name | 节点名称 |
| server | server | 服务器地址 |
| server_port | port | 端口号（前端会转为数字类型） |
| password | password | 密码 |
| method | cipher | 加密方式 |
| obfs | obfs | 混淆方式 |
| obfsparam | obfs-param | 混淆参数 |
| protocol | protocol | 协议 |
| protocolparam | protocol-param | 协议参数 |

### 4.2 单端口模式判断

- `single == 1`：使用节点的 `server_port`、`password`、`protocol` 配置
- `single != 1`：使用用户账号的端口/密码/协议配置（后端应已处理）

### 4.3 转换输出示例

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
  - name: "GLOBAL"
    type: select
    proxies:
      - "DIRECT"
      - "REJECT"
      - "美国 (US)"
      - "香港 (HK)"
  - name: "美国 (US)"
    type: select
    proxies:
      - "美国-01"
```

---

## 5. 错误处理规范

### 5.1 错误场景

| 场景 | 前端处理方式 |
|------|-------------|
| 登录失败 | 显示后端返回的 `message` |
| UserID 无效 | 清除 localStorage，跳转登录页 |
| getNodeList 失败 | 显示错误信息和重试按钮 |
| 网络错误 | 显示 "网络连接失败，请检查网络" |

### 5.2 HTTP 状态码

| 状态码 | 含义 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（UserID 无效） |
| 403 | 禁止访问 |
| 500 | 服务器内部错误 |

---

## 6. 安全注意事项

1. **密码传输**：密码应在前端进行加密后再传输（建议使用 HTTPS）
2. **UserID 存储**：UserID 存储在 localStorage，前端应在每次请求时验证其有效性
3. **敏感信息**：响应中的 `password`、`obfsparam`、`protocolparam` 等敏感字段应妥善保管

---

## 7. 后续优化建议

1. **Token 认证**：考虑引入 Token 机制替代 UserID 认证
2. **会话管理**：增加 Session 或 Token 过期机制
3. **设备绑定**：利用 DeviceIMEI 实现设备绑定和限制
4. **流量限制**：后端可增加流量控制逻辑

---

**文档状态**：已完成，待后端实现确认
**下一步**：后端实现接口 → 前端联调测试
