## 1. A day's work in the console alone

- [ ] 1.1 Build the side chat, effort level and session titles as the composer and sessions-tab changes that follow this one. Verify: each change's own scenarios pass, named in its spec under openspec/changes.
- [ ] 1.2 Build the Anthropic-hosted connection after the connecting pages of the console. Verify: the scenarios of openspec/changes/infra-agent-console-anthropic-hosted-sessions pass.
- [ ] 1.3 Work one day in the console alone and write each return to the terminal into the workflow comparison, closing each one that recurs. Verify: a reviewer reads the workflow comparison and finds no return left open.

## 2. The page and its hosts

- [ ] 2.1 Keep the page as manager with no session of its own, reconnecting after a reload and replaying each open log. Verify: a test named after the scenario 'Connecting mid-session' in the built host spec, which replays each open session's log to a page that connects, written first and seen failing.
- [ ] 2.2 Show a host that dies without a word as not answering, retried with growing delays. Verify: tests named after the scenarios 'A host that goes without a word' and 'The host restarts after a drop' in the built host spec, written first and seen failing.
- [ ] 2.3 Tell every connected page when a host stops from its own window. Verify: a test named after the scenario 'Stopping the host with Ctrl+C' in the built host spec, which tells every page before the sessions close, written first and seen failing.

## 3. Windows and views

- [ ] 3.1 Run each host and session only in a window the reader can see and close, with nothing left after it closes. Verify: tests named after the scenarios 'Closing one session's window' in the built session-windows spec and 'Nothing starts when the computer starts' written first and seen failing.
- [ ] 3.2 Build a view only while it is in view. Verify: a test named after the scenario 'A view out of view is not built' written first and seen failing.

## 4. Themes and the terminal

- [ ] 4.1 Build the Genshin theme once a day's work fits in the console. Verify: the scenarios of openspec/changes/infra-agent-console-themes pass.
- [ ] 4.2 Build the terminal-mirror driver once a session started in a terminal needs to be picked up, after the channel's permission relay ships. Verify: the scenarios of openspec/changes/infra-agent-console-terminal-mirror-driver pass.
