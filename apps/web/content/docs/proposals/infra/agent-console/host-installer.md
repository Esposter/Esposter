---
title: Host installer
description: Proposal — the agent console's host installs once from a download, as a standalone app carrying its own runtime, so connecting needs no pnpm, Node or command, and a page starts it through the browser's own open-app prompt.
model: claude-opus-5-5
---

# Host Installer

A sub-spec of the [agent console](/docs/proposals/infra/agent-console). The [host](/docs/infra/claude-interface/agent-console/host) starts today only as `pnpm dlx agent-console-server` in a terminal. That asks a reader to have Node and pnpm, to know what a terminal is, and to start it again after every restart. A web page cannot install or start a program on the reader's machine, since the browser's sandbox exists to forbid exactly that. So the one step that cannot be removed is a single install, and everything after it is a click. T3 Code makes the same split: a desktop app runs its backend, and the command stays for people who want it ([T3 Code](https://github.com/pingdotgg/t3code)).

## What it changes

- **One executable per platform, carrying its own runtime.** The host is built into a single executable with Node's `--build-sea`, which embeds the runtime beside the bundled host, so the reader installs nothing else ([Node single executable applications](https://nodejs.org/api/single-executable-applications.html)). The builds are the platforms Node tests it on: Windows, macOS on arm64 and Linux.
- **The installer is offered where it is needed.** When [device pairing](/docs/proposals/infra/agent-console/device-pairing)'s **Connect to this computer** finds no host, the screen offers the installer for the reader's platform, read from the browser, with the command folded under it for anyone who prefers that.
- **It registers `esposter-host://`.** Opening a link on that scheme starts the host if it is not running. The browser asks the reader first — _Open Esposter Host?_ — and that prompt is the permission the reader agrees to; no page can skip it. Windows takes the scheme in the user's registry classes, macOS in the app bundle's `Info.plist`, and Linux in a `.desktop` file's `x-scheme-handler` entry.
- **It starts with the reader's login**, as a login item with no window, so an installed host is running whenever the reader is. Its tray or menu-bar icon quits it.
- **Claude Code's login stays Claude Code's.** A host that finds no Claude Code login opens Claude Code's own sign-in, and the console waits for it instead of asking for anything itself.
- **The command stays**, for a machine the reader reaches over SSH, where there is no browser to open a link in.
- **Releases are signed.** An unsigned executable meets SmartScreen on Windows and Gatekeeper on macOS, and each warning reads as malware to the reader it should reassure. The release signs and notarizes every build.

## What is deliberately not in it

- **No desktop window.** The console is the page. The installed host has an icon and no interface of its own, where T3 Code's desktop app is its whole interface.
- **No updater of its own at first.** The page reports a host older than itself and links the new installer; an updater comes when releases are frequent enough to make that a chore.

## Key files

| File                                                     | Role after the change                                               |
| -------------------------------------------------------- | ------------------------------------------------------------------- |
| `packages/agent-console-server/package.json`             | a script building each platform's single executable                 |
| `packages/agent-console-server/src/cli.ts`               | the scheme's launch arguments, and starting quietly at login        |
| `apps/web/app/components/AgentConsole/Panel/Pairing.vue` | the installer for the reader's platform when no host answers        |
| `.github/workflows/Release.yaml`                         | builds, signs and attaches each platform's installer to the release |

## Sources

- [Node.js — single executable applications](https://nodejs.org/api/single-executable-applications.html) — `--build-sea` since v25.5.0, and the platforms it is tested on.
- [T3 Code](https://github.com/pingdotgg/t3code) — a desktop app running the backend behind its web interface, with the command kept beside it.
