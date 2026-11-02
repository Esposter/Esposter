# agent-console-server

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

It runs your Claude Code sessions on your own machine. The host serves them to the [Esposter agent console](https://esposter.com/agent-console) over one WebSocket that admits only paired browsers.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/infra/claude-interface/agent-console).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- ⌨️ [Commands](#commands)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

Start the host:

```bash
pnpm dlx agent-console-server
```

On Windows, a standalone host needs no Node or pnpm.

1. Download `agent-console-host.exe` from the [latest release](https://github.com/Esposter/Esposter/releases/latest).
2. Open `agent-console-host.exe`. Windows asks once, because the host is unsigned.
3. Choose More info, then Run anyway.

The host installs itself into `%LOCALAPPDATA%\Esposter\Host`. It also does the following:

- Writes out the Claude Code binary that it carries.
- Registers the `esposter-host://` link. The page uses this link to start the host.
- Runs in its own console window.

To remove the host, run `agent-console-host.exe uninstall`.

To pair a browser:

1. Press Connect on the page, or hold Ctrl and click the one-time link that the host prints.
2. Run `agent-console-server devices`. The paired browser appears in the list.

Each browser pairs with a credential of its own. The host proves itself with a key before a page sends its credential. The host keeps its key and each browser's credential hash in `{home}/.agent-console-server`. The browser keeps its credential and the host's public key in local storage. A paired page stays paired across restarts.

To remove a paired browser, run `agent-console-server devices --revoke <id>`.

Sessions run through the Claude Agent SDK. They use your own settings, CLAUDE.md, skills, hooks and plugins. Sessions are written where the terminal writes them. So `claude --resume <id>` resumes a console session, and the console resumes a terminal session.

The wire uses Zod contracts. They are exported as the `contracts` subpath.

## <a name="key-exports">🧩 Key Exports</a>

| Export                           | What it is                                                                                      |
| :------------------------------- | :---------------------------------------------------------------------------------------------- |
| `agent-console-server/contracts` | The wire: the session list, the event union, the command union and the server messages          |
| `createAgentConsoleServer`       | The host: an HTTP listener answering the private-network preflight and the paired pages' socket |
| `createClaudeAgentSdkDriver`     | The Claude Code driver, one streaming-input Agent SDK query per open session                    |
| `Driver`                         | The interface another agent's driver implements                                                 |

## <a name="commands">⌨️ Commands</a>

- Start the host: `agent-console-server [--port <port>] [--hostname <address>] [--origin <app origin>]`
- List or revoke paired browsers: `agent-console-server devices [--revoke <id>]`

| Flag         | Default                | What it does                                                                                              |
| :----------- | :--------------------- | :-------------------------------------------------------------------------------------------------------- |
| `--hostname` | `127.0.0.1`            | The address to listen on. `0.0.0.0` lets another machine reach the host, over a network you already trust |
| `--origin`   | `https://esposter.com` | The app the printed link opens, and the one origin that may pair, such as `http://localhost:3000`         |
| `--port`     | `7437`                 | The port to listen on, and the one in the link it prints                                                  |

Run these commands in `packages/agent-console-server/`:

```bash
pnpm build        # compile to dist/
pnpm build:sea    # single-executable build
pnpm dev          # local dev server, below
pnpm start        # node bin/cli.js
```

`pnpm dev` builds the host and starts it for the local dev server at `http://localhost:3000`. Close any other host first, since both take the same port.

**Warning:** each restart ends the open sessions, and the page must reconnect. `pnpm dev` rebuilds and restarts the host on every change to the source.

Pair through the link that the host prints. The page's Connect starts the installed host, and the installed host pairs only with the deployed site.

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/agent-console-server/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/agent-console-server/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/agent-console-server/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/agent-console-server.svg
