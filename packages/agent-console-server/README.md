# agent-console-server

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

Runs your Claude Code sessions on your own machine and serves them to the [Esposter agent console](https://esposter.com/agent-console) over one WebSocket that admits only the browsers paired with it. Sessions go through the Claude Agent SDK with your own settings, CLAUDE.md, skills, hooks and plugins, and they are written where the terminal writes them, so `claude --resume <id>` picks up a console session and the console picks up a terminal one. The wire is Zod contracts, exported as the `contracts` subpath.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm dlx agent-console-server
```

On Windows there is also a standalone host that needs no Node or pnpm: download `agent-console-host.exe` from the [latest release](https://github.com/Esposter/Esposter/releases/latest) and open it. It installs itself into `%LOCALAPPDATA%\Esposter\Host`, writes out the Claude Code binary it carries, registers the `esposter-host://` link the page starts it with, and runs in a console window of its own; `agent-console-host.exe uninstall` removes it. It is unsigned, so Windows asks once — choose More info, then Run anyway.

Press Connect on the page, or hold Ctrl and click the one-time link the host prints. Each browser pairs with a credential of its own, and the host proves itself with a key before a page sends it. Both are kept in `~/.agent-console-server`, so a paired page stays paired across restarts. `agent-console-server devices` lists the paired browsers, and `devices --revoke <id>` removes one.

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://esposter.com/docs/api/modules/agent-console-server.html) to level up.

`agent-console-server [--port <port>] [--hostname <address>] [--origin <app origin>]`, and `agent-console-server devices [--revoke <id>]`

| Flag         | Default                | What it does                                                                                              |
| :----------- | :--------------------- | :-------------------------------------------------------------------------------------------------------- |
| `--port`     | `7437`                 | The port to listen on, and the one in the link it prints                                                  |
| `--hostname` | `127.0.0.1`            | The address to listen on. `0.0.0.0` lets another machine reach the host, over a network you already trust |
| `--origin`   | `https://esposter.com` | The app the printed link opens, and the one origin that may pair, such as `http://localhost:3000`         |

| Export                           | What it is                                                                                      |
| :------------------------------- | :---------------------------------------------------------------------------------------------- |
| `agent-console-server/contracts` | The wire: the session list, the event union, the command union and the server messages          |
| `createAgentConsoleServer`       | The host: an HTTP listener answering the private-network preflight and the paired pages' socket |
| `createClaudeAgentSdkDriver`     | The Claude Code driver, one streaming-input Agent SDK query per open session                    |
| `Driver`                         | The interface another agent's driver implements                                                 |

Commands: `pnpm build`, `pnpm test`, `pnpm typecheck`, `pnpm lint:fix`.

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/agent-console-server/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/agent-console-server/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/agent-console-server/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/agent-console-server.svg
