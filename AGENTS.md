# Agents

## 开发环境

```bash
pnpm i
pnpm run prebuild   # 下载 Mihomo 内核和服务二进制文件；首次开发前必须执行
pnpm dev
```

Windows ARM 还需要安装 LLVM (clang)。

## 构建

```bash
pnpm build          # 生产构建
pnpm build:fast     # 更快构建，带调试符号
```

## 质量检查

前端（从仓库根目录运行）：
```bash
pnpm lint           # ESLint
pnpm format:check   # Biome 格式化
pnpm typecheck      # TypeScript 类型检查
```

Rust（在 src-tauri 中运行）：
```bash
cargo clippy-all
cargo fmt
```

CI 在 `src/**` 变更时运行前端检查；在 `src-tauri/**` 变更时运行 clippy。

## 项目结构

- `src/` - React 前端（TypeScript）
- `src-tauri/` - Tauri/Rust 后端（edition 2024，Windows 上使用 MSVC 工具链）
- `crates/` - 工作区 crates：clash-verge-draft、clash-verge-logging、clash-verge-signal、clash-verge-i18n、clash-verge-limiter、tauri-plugin-clash-verge-sysinfo

## 重要提示

- 路径别名：`@/*` 映射到 `./src/*`（定义在 tsconfig.json）
- `pnpm run prebuild` 是开发前必须执行的——它会下载 Mihomo 内核和服务二进制文件
- Rust 版本要求：1.91
- Windows：使用 `x86_64-pc-windows-msvc` 目标，MSVC 工具链
- `verge-dev` 特性标志启用彩色日志（`pnpm dev -f verge-dev`）
