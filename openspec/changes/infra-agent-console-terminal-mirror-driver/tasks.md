## 1. Blocked on the permission relay

- [ ] 1.1 Confirm the chat channel declares its permission relay before this driver is built. Verify: `grep -n "claude/channel/permission" packages/genshin-persona/scripts/channel.ts` prints a match.
- [ ] 1.2 Map a terminal session's transcript entries into console events, using the console's own history mapper. Verify: a test named after the scenario 'A terminal session shows its new turns' written first and seen failing.
- [ ] 1.3 Refuse prompts for a session started without the channel flag. Verify: a test named after the scenario 'A session without the channel flag cannot be sent prompts' written first and seen failing.

## 2. Channel commands

- [ ] 2.1 Send prompts and permission verdicts through the session's channel. Verify: tests named after the scenarios 'A prompt reaches the terminal session' and 'A verdict answers the terminal's permission request' written first and seen failing.
- [ ] 2.2 Grey out the controls a channel cannot reach, with the reason. Verify: a test named after the scenario 'A mirrored session greys out the controls a channel cannot reach' written first and seen failing.

## 3. Handover between drivers

- [ ] 3.1 Hold each session in exactly one driver. Verify: a test named after the scenario 'A session is held by one driver only' written first and seen failing.
- [ ] 3.2 Move a mirrored session to the console's own driver on resume after its terminal closes. Verify: a test named after the scenario 'Resuming after the terminal closes restores every control' written first and seen failing.
