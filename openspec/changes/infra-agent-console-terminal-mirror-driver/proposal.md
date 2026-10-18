# Terminal-mirror driver

## Why

The console works sessions through its own Agent SDK driver, which opens and holds each session itself. Two cases are beyond it. A session a terminal started before the host was running, with the channel flag, cannot be held by the host because the terminal already holds it. And a moment may come when SDK use is no longer covered by the subscription. In both cases the console needs a way to see and work a session it does not hold.

## What Changes

The console attaches to a session a terminal runs, reads it from its transcript, and sends it prompts and permission verdicts through the session's channel.

- A session started in a terminal with the channel flag appears in the console, with the same events the console's own driver produces from the same transcript content.
- A prompt and a permission verdict go to the terminal's session through its channel.
- Interrupt, mode, model and the harness's own slash commands are greyed out for a mirrored session, with the reason shown.
- Each session is held by exactly one driver. Resuming a mirrored session after its terminal has closed moves it to the console's own driver, with every control back.
- A session started in a terminal without the channel flag is out of the console's reach.

## Capabilities

- **infra/agent-console/terminal-mirror-driver** (new)

## Waiting on

- The channel's permission relay, which `openspec/changes/infra-channel-chat/` still lists as unbuilt. That relay's two-choice bubble waits on `openspec/changes/infra-viewer-stage/`.

## Impact

- The console's sessions can be held by a second kind of driver, with the page unchanged for it.
- A mirrored session shows some controls greyed out and says why.
- The console's own history reading is reused for the transcript, so both drivers show the same turns.

Size kept as the source page's own: splitting it is a later decision.
