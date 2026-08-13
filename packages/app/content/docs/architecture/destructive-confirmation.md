---
title: Destructive Confirmation
description: One shared delete-confirmation dialog — StyledDeleteFormDialog with an opt-in Azure-style type-the-name guard.
---

# Destructive Confirmation

Every destructive action in the app confirms through **one** component: `StyledDeleteFormDialog`. It wraps `StyledFormDialog` — the middle layer of the [dialog shell](/docs/architecture/dialog-shell) — with a red `Delete` confirm button and emits `delete(onComplete)` on submit, so the consumer runs its mutation and calls `onComplete()` to close the dialog. Feature code never hand-rolls a `v-dialog` + confirm-button flow; if a delete confirmation needs something the shared component lacks, the capability is added to the shared component so every caller can opt in.

## The type-the-name guard

High-stakes deletes add the Azure-portal-style guard by passing `confirmName`:

```vue
<StyledDeleteFormDialog :card-props="{ title: 'Delete resource' }" :confirm-name="resource.name" @delete="...">
  Delete "{{ resource.name }}"? This cannot be undone.
</StyledDeleteFormDialog>
```

The component renders the name in a `v-code` block with a `StyledClipboardIconButton` beside it — copying the name is part of the shared base, not something a caller adds — followed by an autofocused text field labelled `Type '<name>' to confirm`, and keeps the `Delete` button disabled until the input matches exactly. The typed value resets whenever the dialog closes, so a reopened dialog always starts locked. Bulk actions use a count phrase as the name (`delete 12`), which scales the guard without listing every item.

## Choosing the tier

| Tier                         | When                                                                                                      | Example consumers                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Plain confirm (no guard)     | Routine, low-blast-radius deletes — a single message, draft, row, ban, webhook, role, or dashboard visual | Message/draft delete, file-table row delete, ban removal, role delete, dashboard visual delete |
| `confirmName` = entity name  | Irreversible container-level deletes where losing the wrong one is expensive                              | Resource delete, edit-form entity delete, room delete (type the room name)                     |
| `confirmName` = count phrase | Bulk destructive actions — the phrase encodes how many items are about to disappear                       | Resource list bulk delete (`delete 12`)                                                        |

## Key files

| File                                                                 | Role                                                                                                         |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `app/components/Styled/DeleteFormDialog.vue`                         | The shared dialog — red Delete button, `delete(onComplete)` emit, `confirmName` guard with its copyable name |
| `app/components/Styled/ConfirmDeleteDialogButton.vue`                | Icon-button activator + plain confirm, for toolbars                                                          |
| `app/components/Styled/EditFormDialog/ConfirmDeleteDialogButton.vue` | Edit-form entity delete — passes the entity name as `confirmName`                                            |
| `app/components/Resource/List/DeleteDialog.vue`                      | Singleton resource delete with `confirmName` = resource name                                                 |
| `app/components/Resource/List/SelectionToolbar.vue`                  | Bulk delete with `confirmName` = `delete <count>`                                                            |

## Notes

- The two `ConfirmDeleteDialogButton` components are the two tiers above wearing an icon button, not a duplicate pair. `Styled/ConfirmDeleteDialogButton` is the plain-confirm one: it takes free-form body content and a title, and belongs in a toolbar acting on a selection. `Styled/EditFormDialog/ConfirmDeleteDialogButton` is the guarded one: it derives its title and its prose from the entity being edited and always passes `confirmName`, so an editor cannot ship a container-level delete without the guard. Collapsing them would make the guard a caller's choice again, which is the thing the tier table decides once.
- No destructive button deletes on click — every one opens this dialog first. A button keeps its own styling by supplying the activator slot and calling `updateIsOpen(true)` (e.g. the role and dashboard-visual delete buttons wrap `StyledDeleteFormDialog` around their existing icon button rather than adopting `StyledConfirmDeleteDialogButton`'s look).
- List-item deletes mount the dialog once per list and target it through a dialog store — see [Singleton dialogs](/docs/architecture/singleton-dialogs).
- `StyledEditFormDialogConfirmCloseDialogButton` (save/discard/cancel on dirty close) is a three-action decision dialog, not a destructive confirmation — it composes the [dialog shell](/docs/architecture/dialog-shell) directly, carrying discard in `prepend-actions`, and stays outside this component on purpose.
