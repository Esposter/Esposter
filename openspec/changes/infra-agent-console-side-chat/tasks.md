## 1. Fork

- [x] 1.1 Open the side chat's fork with no saved session behind it, in plan mode. Verify: a test named after the scenario 'A closed side chat leaves no saved session' written first and seen failing.
- [x] 1.2 Start the first question from the session's latest message. Verify: a test named after the scenario 'The first question is answered with the conversation as context' written first. It passed before the change, because the whole-conversation fork (an empty message uuid) already starts at the latest message, so the test pins that behaviour rather than being seen failing first.
- [x] 1.3 Keep the side chat from changing files. Verify: a test named after the scenario 'A side chat question cannot become edits' written first and seen failing.

## 2. Drawer

- [ ] 2.1 Open the drawer beside the conversation with its own composer on Ctrl+;. Verify: tests whose scenarios are 'The chord opens the side chat' and 'A side chat question leaves the main conversation unchanged' written first and seen failing. Open: not built in this unit. The conversation, the composer and their reads in `store/agentConsole/session.ts` all resolve the one `currentSessionId`, so a drawer needs them to render a second session. That is a store and component refactor across the Conversation, Composer, Permission, Hud, Changes, Timeline and MessageActions components, whose layout only the person can check. The host side it sends to is in place (tasks 1.1 to 1.3).
- [x] 2.2 Leave an open side chat out of the sessions list. Verify: a test whose scenario is 'An open side chat is hidden from the sessions list' written first and seen failing. Done on the host, in `listSessionSummaries.ts`, so every page's list leaves it out; the window path carries the flag on open and on rejoin.
- [ ] 2.3 Discard the side chat and its answers when the drawer closes. Verify: a test named after the scenario 'Closing the drawer discards its answers' written first and seen failing. Open: depends on the drawer in 2.1. The host already closes a fork's session and writes no transcript for it, so closing needs only the drawer's close command.
