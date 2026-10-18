# Spatial chat

## Why

The conversation panel shows a reply as a message under the one that asked, and the world already shows new replies as chat lines over the character. On the agent console the same reply has nowhere in the scene to be read: the character's spoken lines have no place over the figure, and a plain answer has no place set down beside it. An answer's code, table or explanation is text the reader copies, so it has to stay text.

## What Changes

The Genshin theme can show a reply in the scene instead of the list, with the character's spoken lines as bubbles and each plain answer as a panel.

- Each spoken line is a bubble above the figure, one at a time, in the order the reply carries them, and each new line replaces the one before it.
- Each answer sent through the reply tool becomes a panel in the scene. The newest panel sits in front, older panels slide into a stack, and a click on a stacked panel brings it forward again.
- Panels hold ordinary text that can be selected and copied.
- The text box works as it does in the default theme, and a toggle returns to the list view.

## Capabilities

- **infra/agent-console/spatial-chat** (new)

## Waiting on

- `openspec/changes/infra-agent-console-themes/`, whose Genshin theme voice supplies the spoken lines the bubbles show.

## Impact

- The Genshin theme gains a scene view of the conversation, with a toggle back to the list.
- Spoken lines are shown as bubbles over the character.
- Answers are shown as panels in the scene, which the reader can select, copy and scroll.
