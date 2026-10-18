# The viewer as the stage

## Why

Today a reply's spoken lines play through each desktop's stock audio player, and the terminal's status line is as much of the character as the screen shows. The desktop companion wanted a face, a speech bubble and a body that reacts. Live2DViewerEX, a desktop pet the reader already runs on Windows with their own models loaded, is already a transparent window over every other app and exposes a loopback socket that takes a bubble, a sound and a motion and sends back a tap. It can be the stage, so the plugin only needs a second place to send a line beside the stock player.

## What Changes

When a viewer is on file, the character's lines show on the model and the model's reactions follow the session, and the stock player stays the fallback.

- Each spoken line is shown as a bubble on the model and its sound is played on the model, and the stock player plays the reading when no viewer listens.
- The notification and stop hooks send a motion for attention wanted and clear the expression at the end of a turn, from a motion map the reader fills in. A moment with no mapping sends nothing.
- A tap on the model replays the line the character said last, without synthesizing it again.
- A `viewer` verb writes the address and the motion map, proves the connection with one bubble, and `teardown` removes it.
- A machine with no viewer is unchanged.
- The character is not driven by a turn from the model. A tap replays a line and never sends a turn to the session.

## Capabilities

- **infra/viewer-stage** (new)

## Waiting on

The reader's install for tasks 1.1 and 1.2 in `tasks.md`: a Live2DViewerEX run with a model loaded, which decides whether the model lip-syncs from a WAV path and whether a tap reaches the synthesizer. The rest ships and is tested without it.

## Impact

- The spoken-line pipeline gains a second sink, the viewer, beside the stock player.
- The plugin's hooks gain a notification and a stop reaction, each behind the same file check.
- The reader gains a verb that sets up the viewer and removes it again.
