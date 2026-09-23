---
title: Host
description: agent-console-server, the process the agent console pairs with. It runs with one command on the machine that holds the code and listens on the loopback behind a token kept in the home directory. It answers the browser's private-network preflight, prints the link that pairs a page, and replays each open session's event log to a page that connects mid-session.
---

# Host

`agent-console-server` is the half of the [agent console](/docs/infra/claude-interface/agent-console) that runs where the code is. It holds everything sensitive: the Claude Code login, the repositories and the sessions. The page holds only the host's address and token, in the browser's own storage. No session, key or repository ever reaches Esposter's servers. The app serves the page and nothing else.

## How it works

```mermaid
flowchart TD
  Start[pnpm dlx agent-console-server] --> Token[Read the token from the home directory, or make one]
  Token --> Print[Print the pairing link and the host URL]
  Print --> Open[The page opens the link: the host URL is read from the fragment and cleared]
  Open --> Upgrade{Upgrade carries the token?}
  Upgrade -->|no| Refuse[401 and the socket closes]
  Upgrade -->|yes| Replay[Every open session's log replayed, then the session list]
  Replay --> Live[Live events broadcast to every page; commands answered to the page that sent them]
  Live -->|socket drops| Retry[The page retries, backing off up to thirty seconds, until the host answers]
  Retry --> Upgrade
```

- **One command, one socket.** The host is a plain HTTP listener with a WebSocket upgrade. It listens on `127.0.0.1` at a fixed default port, so the page can check for a running host before anything is paired. `--hostname 0.0.0.0` makes it reachable from another machine, over whatever network already reaches that machine. Esposter runs no relay. The token and every message cross that path, so a remote host is reached over `wss://` or an encrypted tunnel — an SSH forward to the page's own loopback is the simplest — and never plain `ws://`, which a page on `https` refuses beyond the loopback anyway.
- **The token.** It is made once and kept in `~/.agent-console-server/token`, readable by the person alone, so a page paired once stays paired across restarts. Every upgrade must carry it, and it is compared in constant time. Deleting the file revokes every paired page on the next start.
- **Pairing.** The host prints a link to the app's `/agent-console` with its own address in the URL fragment. A fragment never reaches a server, and the page reads it once and clears it. `--origin` points the link at a local dev server instead of the deployed site. The printed `ws://` URL can also be pasted into the page.
- **The private-network preflight.** A page on `https` reaching a loopback address is a local network request. Current Chrome gates it on its Local Network Access permission, a prompt the person answers once per site, rather than on the private-network preflight it replaced. The host still answers every `OPTIONS` with `Access-Control-Allow-Private-Network` for a browser that sends the preflight. A page on the local dev server is loopback to loopback and needs neither.
- **The replayed log.** The host keeps every open session's events from the moment it opened, and drops an event already logged under its id. A page that connects or reconnects receives the whole log first. A session reopened under the same id, which is what a rewind does, has its log reset, and every page is told to drop what it held.
- **Commands.** Each command carries an id the page chose. A command that opens a session is answered with the session it opened, so the page that asked moves to it. A command that fails is answered with why, and a message that is not a command at all is answered under an empty id.

## Key files

| File                                                                            | Role                                                                    |
| :------------------------------------------------------------------------------ | :---------------------------------------------------------------------- |
| `packages/agent-console-server/src/cli.ts`                                      | The command: flags, the token, the printed link, closing on Ctrl+C      |
| `packages/agent-console-server/src/services/server/createAgentConsoleServer.ts` | The listener, the token gate, the log replay and the command replies    |
| `packages/agent-console-server/src/services/server/answerHttpRequest.ts`        | The preflight answer and the probe the page uses to find a running host |
| `packages/agent-console-server/src/services/server/createEventLog.ts`           | Each open session's log, one event per id                               |
| `packages/agent-console-server/src/services/server/readToken.ts`                | The token, made once and kept in the home directory                     |
| `apps/web/app/store/agentConsole/connection.ts`                                 | The page's side: pairing, the socket, the backoff, routing what arrives |

## Notes

- A probe of the loopback port tells the page that a host is running, and nothing more. The answer carries no token, so a page cannot pair itself with a host by finding one.
- Ctrl+C closes every session's Claude Code process before the host exits, rather than leaving them orphaned.
