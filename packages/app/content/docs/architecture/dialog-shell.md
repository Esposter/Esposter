---
title: Dialog shell
description: One dialog shell — StyledDialog owns the card, the scrollable body slot, the actions row and the confirm button every dialog confirms through.
---

# Dialog Shell

Every dialog that asks for something renders through one shell, `StyledDialog`. It owns the whole frame — the `v-dialog`, the `StyledCard` inside it, the full-screen toggle in the card's append slot, the padded scrollable body, and the actions row — so the required contract is three things: what the header says (`cardProps`), what the confirm button says (`confirmButtonProps`), and bare body content in the default slot. Two optional controls sit alongside them — `#prepend-actions` for an action that belongs on the row's leading edge, and `hideCancelButton` for a dialog whose only way out is confirming. Nothing else in the app hand-rolls a `v-dialog` + confirm-button pair.

Three shells build on each other. `StyledFormDialog` wraps the base with a `v-form`, a generated form id and submit wiring, so its confirm button is a real submit that carries validity, `loading` and the disabled state without the consumer computing any of them. `StyledDeleteFormDialog` wraps that with the red `Delete` button and the opt-in type-the-name guard described in [destructive confirmation](/docs/architecture/destructive-confirmation). `StyledEditFormDialog` is the editor-shaped sibling rather than a fourth layer: it trades the card title for a `v-toolbar` header carrying save, delete, validity and full-screen controls, because an editor's actions live at the top where the form below can scroll past them.

## How one dialog renders

```mermaid
flowchart TD
  CONSUMER["consumer — cardProps, confirmButtonProps, body slot"] --> SHELL["StyledDialog — v-dialog wrapping StyledCard"]
  SHELL --> HEADER["header from cardProps — title, subtitle, prependIcon, full-screen toggle"]
  HEADER --> BODY["default slot — padded, scrollable, one column with its own rhythm"]
  BODY --> ACTIONS["actions row — prepend-actions, spacer, Cancel"]
  ACTIONS --> GATE{"did the caller name a confirm colour"}
  GATE -->|"no"| GRADIENT["StyledButton — the midnight-bloom gradient"]
  GATE -->|"yes"| PLAIN["outlined v-btn in that colour"]
  GRADIENT --> CONFIRM["confirm emits onComplete — the consumer runs its mutation, then closes"]
  PLAIN --> CONFIRM
```

## The rules the shell enforces

**Body content is the default slot, never `cardProps.text`.** `cardProps` describes the header — title, subtitle, prepend icon — and Vuetify's `text` prop renders outside the shell's own `v-card-text`, so a message passed that way escapes the scroll container and the column rhythm the shell sets for every other dialog. A sentence of prose is still a body: pass it as children.

**The actions row belongs to the shell.** Cancel is the shell's and closes the dialog. A third choice — discard, skip, "export anyway" — goes in the `#prepend-actions` slot, which renders on the leading edge before the spacer, so the two standing answers stay together on the trailing edge wherever the dialog appears. An informational dialog that only acknowledges passes `hideCancelButton`, because cancelling is meaningless when nothing is pending.

**The confirm button comes from the shell, not from the caller.** A confirm with no colour is the app's primary action and paints as the `StyledButton` gradient — a colourless flat `v-btn` is transparent on the app's base, which is why the `vuetify` skill bans one as a primary action. Naming a colour means the confirm should not look inviting — `error` for a destructive action, `warning` for a cautionary one — and the shell renders an outlined button in that colour instead. Either way the consumer passes only `confirmButtonProps`, and never reaches past the shell to build its own button.

**Confirming is asynchronous and the consumer closes the dialog.** `confirm` emits an `onComplete` callback rather than closing on click, so a failed mutation leaves the dialog open with the user's draft intact. `StyledFormDialog` extends the same callback with an `isSuccessful` flag and keeps its submit button in `loading` until it is called.

**Section dividers take the theme default.** The hairlines the shell draws between header, body and actions are Vuetify's own. A `thickness="2"` divider means something different and is not a heavier version of the same thing: it is the separator between a toolbar and the content it commands — the edit-form header, the rich-text menu bar, the note editor — and its vertical form separates control groups inside such a toolbar. Reading a divider tells you which of the two you are looking at, so neither takes the other's weight.

**Quote what the action is about with `StyledPreviewCard`.** A confirm dialog that names one message, post or comment renders it inside `StyledPreviewCard` — a bordered, shadowed box rather than a `StyledCard`. That is deliberate: the dialog is already a surface, so a nested surface-coloured card would be invisible against it, and the point of the preview is to read as a quotation of content lifted out of somewhere else.

## Dialogs with nothing to confirm

A dialog that only shows something — the search palette, the keyboard shortcuts sheet — has no confirm and no cancel, so it does not compose the actions shell. It takes the card instead: a `v-dialog` around `StyledCard`, dismissed by clicking away, by its own close button, or by the hotkey that opened it. `StyledSearchDialog` is the shared one of these and is the entry point for every command palette in the app ([search](/docs/architecture/search)); `StyledKeyboardShortcutsDialog` renders a `KeyboardShortcutCategory[]` the same way.

## Key files

| File                                                                | Role                                                                                   |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `app/components/Styled/Dialog.vue`                                  | The shell — card, full-screen toggle, body slot, actions row and confirm button        |
| `app/components/Styled/FormDialog.vue`                              | Adds the `v-form`, submit wiring, validity and loading state to the shell              |
| `app/components/Styled/DeleteFormDialog.vue`                        | The destructive layer — red Delete plus the type-the-name guard                        |
| `app/components/Styled/EditFormDialog/Index.vue`                    | Editor-shaped dialog — toolbar header, full-screen width, dirty-close confirmation     |
| `app/components/Styled/EditFormDialog/ConfirmCloseDialogButton.vue` | Save / discard / cancel on a dirty close, composed on the shell with `prepend-actions` |
| `app/components/Styled/Card.vue`                                    | The bordered card every dialog renders inside                                          |
| `app/components/Styled/PreviewCard.vue`                             | The quoted-content box a confirm dialog shows the target in                            |
| `app/components/Styled/SearchDialog.vue`                            | The action-less palette shell — hotkey, search field, results slot                     |
