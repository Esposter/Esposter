---
title: Host installer
description: Proposal — the agent console's host installs once on Windows from an unsigned download carrying its own runtime, so connecting needs no pnpm, Node or command, and a page starts it through the browser's own open-app prompt in a terminal window of its own, which logs what it does and stops it when closed.
model: claude-opus-5-5
---

# Host Installer

A sub-spec of the [agent console](/docs/proposals/infra/agent-console). The [host](/docs/infra/claude-interface/agent-console/host) starts today only as `pnpm dlx agent-console-server` in a terminal. That asks a reader to have Node and pnpm, to know what a terminal is, and to start it again after every restart. A web page cannot install or start a program on the reader's machine, since the browser's sandbox exists to forbid exactly that. So the one step that cannot be removed is a single install, and everything after it is a click. T3 Code makes the same split: a desktop app runs its backend, and the command stays for people who want it ([T3 Code](https://github.com/pingdotgg/t3code)).

## What it changes

- **One Windows executable, carrying its own runtime.** The host is built into a single executable with Node's `--build-sea`, which embeds the runtime beside the bundled host, so the reader installs nothing else ([Node single executable applications](https://nodejs.org/api/single-executable-applications.html)). It is built for Windows alone for now; macOS and Linux wait with signing on [signed host installers](/docs/infra/deferred/signed-host-installers). A native addon cannot load from inside the executable, since `process.dlopen()` needs a real file, so the pseudo-terminal addon the [shell pane](/docs/proposals/infra/agent-console/shell-pane) adds is installed beside it and loaded from there.
- **The installer is offered where it is needed.** When [device pairing](/docs/proposals/infra/agent-console/device-pairing)'s **Connect to this computer** finds no host, the screen offers the Windows installer, with a line saying SmartScreen asks once behind **More info → Run anyway**, and the command folded under it for any other platform or anyone who prefers it.
- **It registers `esposter-host://`.** Opening a link on that scheme starts the host if it is not running. The browser asks the reader first — _Open Esposter Host?_ — and that prompt is the permission the reader agrees to; no page can skip it. The installer writes the scheme to the user's registry classes, needing no administrator.
- **It runs in a terminal window of its own.** Launched from the scheme, the host opens in a new window of Windows Terminal, or the console host where Windows Terminal is absent, as a browser opens a link in a new window. The window logs what the host does: each page it paired, each session it opens and closes, and any error. It outlives the page, so a dev server's hot reload or a crashed tab never takes a running turn with it, and the page reconnects and is replayed what it missed. One host serves the computer: a launch while it runs reuses it rather than opening a second, and each of its sessions gets a window of its own ([session windows](/docs/proposals/infra/agent-console/session-windows)).
- **Stopping it is closing its window**, which the host already announces to every page as `HostStopping` ([host](/docs/infra/claude-interface/agent-console/host)), so there is never a hidden process to hunt down.
- **Claude Code's login stays Claude Code's.** A host that finds no Claude Code login opens Claude Code's own sign-in, and the console waits for it instead of asking for anything itself.
- **The command stays**, for a machine the reader reaches over SSH, where there is no browser to open a link in.

## What is deliberately not in it

- **No desktop window and no background service.** The console is the page and the host's terminal window is its only other surface, where T3 Code's desktop app is its whole interface. It does not start at login or hide in a tray, since a process the reader cannot see is one they cannot stop.
- **No signing, and no macOS or Linux build.** Each costs a yearly fee; both are [deferred](/docs/infra/deferred/signed-host-installers).
- **No updater of its own at first.** The page reports a host older than itself and links the new installer; an updater comes when releases are frequent enough to make that a chore.

## Key files

| File                                                     | Role after the change                                              |
| -------------------------------------------------------- | ------------------------------------------------------------------ |
| `packages/agent-console-server/package.json`             | a script building the Windows single executable                    |
| `packages/agent-console-server/src/cli.ts`               | the scheme's launch arguments, opening its own window, and its log |
| `apps/web/app/components/AgentConsole/Panel/Pairing.vue` | the Windows installer when no host answers                         |
| `.github/workflows/Release.yaml`                         | builds the Windows installer and attaches it to the release        |

## Sources

- [Node.js — single executable applications](https://nodejs.org/api/single-executable-applications.html) — `--build-sea` since v25.5.0, the platforms it is tested on, and native addons needing a real file to load from.
- [T3 Code](https://github.com/pingdotgg/t3code) — a desktop app running the backend behind its web interface, with the command kept beside it.
