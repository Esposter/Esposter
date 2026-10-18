# Chat into the session

## Why

Every companion with a face gives its owner a session of its own to send lines to, and that session spends the limits the work needs while holding none of the work. A channel changes the answer: a line typed on a local chat page is carried into the session the terminal already runs, and its reply is shown on the same page. The desktop character gets an input that costs no tokens beyond the turn itself, and the work stays in the one session.

## What Changes

A line typed on a local chat page reaches the running Claude Code session, and the plain half of the answer returns to the page.

- The persona plugin starts a channel server with the session and stops it with the session. It serves a chat page on the loopback under a token printed once to the terminal.
- A line posted without the token, or from anywhere but the loopback, is dropped.
- A line typed on the page reaches the session as a line from the desk, and the session answers it as any turn.
- The plain half of an answer returns to the page under the line that asked, through a reply tool. The character's spoken lines are not forwarded, because the viewer already speaks them.
- A tool approval the terminal would ask for is shown as a two-choice bubble on the character, and a tap on either choice is the verdict. This is offered only where a viewer is on file.
- A session reaches the channel only when it was launched with the channel flag.

## Capabilities

- **infra/channel-chat** (new)

## Waiting on

- `openspec/changes/infra-viewer-stage/`, which supplies the viewer that the spoken lines, the permission bubble and the tap probe need.

## Impact

- The persona plugin declares a second server, started with each session.
- The chat page is a local page on the loopback, and it shows the reply under each line.
- The page half of this change is superseded by the agent console program, where a line typed at the character becomes a prompt in the console and the channel remains the input of the terminal-mirror driver (`openspec/changes/infra-agent-console-program/`).
- Launching a session with the channel flag asks for a confirmation on every launch during the research preview.
