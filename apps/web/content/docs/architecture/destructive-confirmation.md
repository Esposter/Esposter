---
title: Destructive Confirmation
description: One shared delete-confirmation dialog — UiConfirmDialog with an opt-in Azure-style type-the-name guard, and StyledDeleteFormDialog where a delete still sits on Vuetify's overlay.
---

# Destructive Confirmation

Every destructive action in the app confirms through one shape of dialog: `UiConfirmDialog`, the UI library's alert dialog ([UI library](/docs/architecture/ui-library)). It shows what the action is about in its default slot, then Cancel and one answer in the danger variant, named by `confirmLabel` (`Delete`, `Leave`, `Revoke`). It opens onto Cancel, so a stray Enter never destroys anything, and it emits `confirm(onComplete)` rather than closing on click: the consumer runs its mutation and calls `onComplete()` to close the dialog, or `onComplete(false)` to keep it open with the answer ready to try again. Feature code never hand-rolls a dialog + confirm-button flow; if a delete confirmation needs something the shared component lacks, the capability is added to the shared component so every caller can opt in.

## On Vuetify's overlay

A delete whose dialog content still opens a Vuetify overlay stays on Vuetify's dialog, since the library's dialog sits in the top layer where a Vuetify menu or select renders underneath and inert. That is `StyledDeleteFormDialog`: the same contract and the same guard, wrapping `StyledFormDialog` — the middle layer of the [dialog shell](/docs/architecture/dialog-shell) — with a red `Delete` confirm button and a `delete(onComplete)` emit. The edit-form dialog's delete is its consumer, and it goes with its last one.

## The type-the-name guard

High-stakes deletes add the Azure-portal-style guard by passing `confirmName`, as the resource list's delete does:

```vue
<UiConfirmDialog
  v-model="isOpen"
  confirm-label="Delete"
  :confirm-name="resource.name"
  title="Delete resource"
  @confirm="..."
>
  Deleting this resource moves it to the Recycle bin for {{ RECYCLE_BIN_RETENTION_DAYS }} days.
</UiConfirmDialog>
```

The component renders the name in a field's code block with the library's copy button beside it — copying the name is part of the shared base, not something a caller adds — followed by an autofocused text field labelled `Type '<name>' to confirm`, and keeps the answer disabled until the input matches exactly. The typed value resets whenever the dialog closes, so a reopened dialog always starts locked. A bulk action over more than one item uses a count phrase as the name (`Delete 12 resources`), which scales the guard without listing every item; a selection of one guards on that item's name, matching the row's own delete.

## Quoting what the action is about

A confirmation that names one message, post or comment shows it, so the reader sees what goes rather than recalling it. A message renders through its own component in preview mode inside a `ui-frame` box; a post or comment renders through `PostPreview`, set off by a guide down its start edge (`ui-guide`) rather than a frame. Either way it reads as a quotation of content lifted out of somewhere else, never as another card nested in the dialog's surface.

## Choosing the tier

| Tier                         | When                                                                                                      | Example consumers                                                                                   |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Plain confirm (no guard)     | Routine, low-blast-radius deletes — a single message, draft, row, ban, webhook, role, or dashboard visual | Message/draft delete, sheet row delete, ban removal, role delete, dashboard visual delete           |
| `confirmName` = entity name  | Irreversible container-level deletes where losing the wrong one is expensive                              | Resource delete, recycle-bin purge, edit-form entity delete, room delete (the owner types the name) |
| `confirmName` = count phrase | Bulk destructive actions — the phrase encodes how many items are about to disappear                       | Resource list bulk delete (`Delete 12 resources`)                                                   |

## Key files

| File                                                                 | Role                                                                                                  |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `app/components/Ui/ConfirmDialog.vue`                                | The shared dialog — Cancel first, the danger answer, `confirm(onComplete)`, the `confirmName` guard   |
| `app/components/Styled/DeleteFormDialog.vue`                         | The same contract on Vuetify's overlay — red Delete button, `delete(onComplete)` emit, the same guard |
| `app/components/Styled/EditFormDialog/ConfirmDeleteDialogButton.vue` | Edit-form entity delete — passes the entity name as `confirmName`                                     |
| `app/components/Resource/List/DeleteDialog.vue`                      | Singleton resource delete with `confirmName` = resource name                                          |
| `app/components/Resource/List/Selection/DeleteButton.vue`            | Bulk delete — the one name for a single selection, the count phrase past it                           |

## Notes

- The edit-form delete always passes `confirmName`, deriving its title and its prose from the entity being edited, so an editor cannot ship a container-level delete without the guard — which tier a delete takes is decided once by the table above, never by a caller's choice.
- No destructive button deletes on click — every one opens this dialog first. A button keeps its own look by opening the dialog itself: the dashboard-visual delete is a `UiIconButton` whose click sets the dialog's model, and the edit-form delete hands its `UiIconButton` to `StyledDeleteFormDialog`'s activator slot and calls `updateIsOpen(true)`.
- List-item deletes mount the dialog once per list and target it through a dialog store — see [Singleton dialogs](/docs/architecture/singleton-dialogs).
- `StyledEditFormDialogConfirmCloseDialogButton` (save/discard/cancel on dirty close) is a three-action decision dialog, not a destructive confirmation — it composes the [dialog shell](/docs/architecture/dialog-shell) directly, carrying discard in `prepend-confirm`, and stays outside this component on purpose.
