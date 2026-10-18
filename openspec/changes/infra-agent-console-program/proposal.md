# Agent console

## Why

The agent console is one page that works every Claude Code session it starts on a machine in place of the terminal. It is judged by whether a day's work can be done in it without going back to a terminal. Until that holds, nothing beyond it is built, and the look, the tooling and the remote hosts that come after it need a shared set of rules so that each one adds without changing the others.

## What Changes

This change is the program that sets the rules the console's follow-on changes build to, and sequences them.

- The page manages sessions on every host it has paired and runs none of them itself, and a reload, a hot reload or a closed tab never ends a turn.
- Both ends stay live: a session started, stopped or answered on the page shows in the host's window at once, and a host stopped from its own window tells every page before it exits.
- Nothing runs hidden: each host and each session runs in a window the reader can see and close, with no login item, tray icon or background service.
- The console's look is behind a theme, and tooling joins through the cheapest tier that fits.
- Views build only while they are in view, and the console ships for Windows first, unsigned, with every secret kept under a key the app already holds.
- Follow-on changes proceed in order: the console alone for a day's work first, then the Genshin theme, then the terminal-mirror driver when a session started in a terminal needs to be picked up.

## Capabilities

- **infra/agent-console** (new)

## Waiting on

- A day's work done in the console alone, with each return to the terminal written into the workflow comparison and closed where it recurs. Nothing in the Genshin theme or the rest of the program is built before that holds.
- The terminal-mirror driver waits on `openspec/changes/infra-channel-chat/` for the channel's permission relay.

## Impact

- The console's page, its hosts and their windows change together, so every connection the page offers follows the same rules.
- The side chat, effort level, session titles and Anthropic-hosted sessions are separate changes that follow this one in order.
- The Genshin theme, its wish banner, element ambience and spatial chat follow the theme change.
- Worktree sessions, remote sessions, split sessions, cross-session messages, the session archive and the rest of the Code tab are deferred or rejected and are not part of this change.

Size kept as the source page's own: splitting it is a later decision.
