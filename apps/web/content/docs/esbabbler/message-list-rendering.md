---
title: Message List Rendering
description: Client architecture of the chat message list — a plain column-reverse scroller, per-item weight budget, single-instance hover bar and dialogs, lazily built emoji index.
---

# Message List Rendering

The message list renders every loaded message as live DOM (no virtualization yet), so anything mounted per item multiplies by the page size and every pagination batch. The architecture therefore keeps each item down to its message component plus a hover wrapper, and everything interactive-but-occasional — the hover bar, the confirm dialogs, the emoji index — exists at most once for the whole list.

## How it works

The list is a plain scroller: one `div` laid out as a reversed flex column, so the newest message sits at the bottom and the scroll position starts there without any script. `MessageModelMessageListContainer` renders one `MessageModelMessageListItemContainer` per message, which resolves the message's creator and renders its `MessageModelMessageListItem` and the timeline's date divider after it. Each item is wrapped in a `display: contents` div so the message component and its overlapping hover bar stay direct flex children of the column while sharing one `mouseenter`/`mouseleave` region — hovering either keeps the bar alive, with no unmount race when the pointer crosses between them.

The hover bar is Discord's: one lifted group, named "Message actions", holding the quick reactions, the emoji picker, the actions a message offers most as quiet icon buttons, and a `UiOverflowMenu` named More holding the rest — its updates, its actions and deleting, each section opening a group. It is mounted with `v-if` only for the item that is hovered, has one of its menus open (`messageStore.optionsMenuRowKey`), or is the target of a context menu — so exactly one instance of that subtree, with its tooltips, popover and menu, exists at a time. It is also the only place a message's action items are built, so a right-click, long press or menu key on a message records the point as `messageStore.contextMenuRequest`, which mounts the bar on that item; the bar then opens the app's one [context menu](/docs/architecture/ui-library#context-menus) at that point with the same list its More menu holds. Reacting stays on the bar, one move away.

The confirm dialogs follow the repo-wide [singleton dialog standard](/docs/architecture/singleton-dialogs): `MessageModelMessageList` mounts one `ConfirmDeleteDialog`, one `ConfirmPinDialog` and one `ReactionsDialog`, driven by the message dialog store's `deletingRowKey`, `pinningRowKey` and `reactionsRowKey` targets. Action items (`useMessageActionItems`) write those store refs directly instead of threading emit chains through the component tree.

```mermaid
flowchart TD
    C[List/Container.vue - one Item per message] --> I[List/Item.vue - display:contents hover wrapper]
    I -->|always mounted| M[Message component via MessageComponentMap]
    I -->|v-if hovered or menu open| O[OptionsMenu - quick reactions, picker, main actions, More]
    M -->|right-click sets contextMenuRequest| S[(messageStore)]
    S -->|mounts over the target| O
    O -->|opens with its items| CM[UiContextMenuHost]
    O -->|action item writes deletingRowKey / pinningRowKey| DS[(messageDialogStore)]
    DS -->|deletingRowKey| D[ConfirmDeleteDialog - singleton in List/Index.vue]
    DS -->|pinningRowKey| P[ConfirmPinDialog - singleton in List/Index.vue]
    O --> E[StyledEmojiPicker - a popover, or a sheet on a narrow screen]
    E -->|its panel mounts on first open| X[getEmojiIndex - built once]
```

## The message component family

`MessageComponentMap` picks a component per `MessageType`, and those components are deliberately thin: each one writes only the sentence or body that is unique to its type and inherits everything else from a shared shell. There are two shells, and a new message type joins one of them rather than assembling `Type/ListItem` again.

`MessageModelMessageTypeBody` is the body of an authored message — the rendered rich text, the `(edited)` marker beside it, the attachment/link-preview/reaction trailing row, and the default slot the inline editor arrives through. `MessageModelMessageType` renders it for both an ordinary and a forwarded message: a forward adds only the quote rail and its **Forwarded** label, then hands the same body component the parent's slot. Re-implementing the body inside the forward branch is what silently drops the edited marker and makes a forwarded message uneditable, so the branch owns the rail and nothing else.

`MessageModelMessageTypeSystemLine` is the shell for the message types nobody authored as prose — call, room edit, pin and system notices. It owns the leading icon, the timestamp and the reaction row, leaving each type one slot of sentence. Secondary text in those sentences is `text-muted`, the palette's muted token, so it follows the theme and the design style; a fixed grey does not.

```mermaid
flowchart TD
  Map["MessageComponentMap[message.type]"] --> Authored{"authored prose?"}
  Authored -->|"Message, Webhook"| Index["Type/Index.vue — avatar, batch header, reply spine"]
  Authored -->|"Call, EditRoom, PinMessage, System"| Line["Type/SystemLine.vue — icon, timestamp, reactions"]
  Authored -->|"Poll"| PollType["Type/Poll.vue — its own card"]
  Index --> Forward{"message.isForward?"}
  Forward -->|"yes"| Rail["quote rail plus Forwarded label"]
  Rail --> Body["Type/Body.vue"]
  Forward -->|"no"| Body
  Body --> Slot{"parent passed the inline editor?"}
  Slot -->|"yes"| Editor["MessageModelMessageEditor"]
  Slot -->|"no"| Text["rich text plus (edited) marker"]
  Body --> Trailing["Type/Trailing.vue — files, link preview, reactions"]
  Line --> Sentence["the type's own sentence"]
```

The emoji index follows the same once-for-the-whole-list rule from the other direction: `getEmojiIndex` builds its maps on first use rather than at import, and the picker's panel mounts on its first open, so a list of reactions never constructs a search index and never builds one per picker instance. See [emoji](/docs/esbabbler/emoji).

## Key files

| File                                                                    | Role                                                                 |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `apps/web/app/components/Message/Model/Message/List/Item.vue`           | Hover wrapper, lazy options menu mount, context-menu handling        |
| `apps/web/app/components/Message/Model/Message/Type/Body.vue`           | Shared authored-message body, edited marker, editor slot             |
| `apps/web/app/components/Message/Model/Message/Type/SystemLine.vue`     | Shared shell for the unauthored message lines                        |
| `apps/web/app/components/Message/Model/Message/OptionsMenu/Index.vue`   | The hover bar, and the context menu it opens with its items          |
| `apps/web/app/components/Message/Model/Message/ConfirmDeleteDialog.vue` | Store-driven delete dialog singleton                                 |
| `apps/web/app/components/Message/Model/Message/ConfirmPinDialog.vue`    | Store-driven pin dialog singleton                                    |
| `apps/web/app/composables/message/message/useMessageActionItems.ts`     | Action items writing store targets directly                          |
| `apps/web/app/components/Message/Model/Message/List/Index.vue`          | The column-reverse scroller and the singleton dialogs                |
| `apps/web/app/services/message/emoji/getEmojiIndex.ts`                  | Shared emoji index, built once on first use                          |
| `apps/web/app/store/message/index.ts`                                   | `optionsMenuRowKey`, `contextMenuRequest`, `editingRowKey`           |
| `apps/web/app/store/message/dialog.ts`                                  | Dialog targets: `deletingRowKey`, `pinningRowKey`, `reactionsRowKey` |

## Notes

- One options-menu or context-menu store write must never fan out re-renders: per-item computeds (`isDisabled`, `isMenuTarget`) only propagate when their own value changes, so untargeted items stay untouched.
- Where the list is anchored — present detection, jump-to-present, bidirectional paging — is
  [message list scrolling](/docs/esbabbler/message-list-scrolling).
- List virtualization is the remaining lever if very long scrollback sessions become a problem.
