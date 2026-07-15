---
title: Destructive Confirmation
description: One shared delete-confirmation dialog — StyledDeleteFormDialog with an opt-in Azure-style type-the-name guard.
---

# Destructive Confirmation

Every destructive action in the app confirms through **one** component: `StyledDeleteFormDialog`. It wraps `StyledFormDialog` with a red `Delete` confirm button and emits `delete(onComplete)` on submit — the consumer runs its mutation and calls `onComplete()` to close the dialog. Feature code never hand-rolls a `v-dialog` + confirm-button flow; if a delete confirmation needs something the shared component lacks, the capability is added to the shared component so every caller can opt in.

## The type-the-name guard

High-stakes deletes add the Azure-portal-style guard by passing `confirmName`:

```vue
<StyledDeleteFormDialog :card-props="{ title: 'Delete resource' }" :confirm-name="resource.name" @delete="...">
  Delete "{{ resource.name }}"? This cannot be undone.
</StyledDeleteFormDialog>
```

The component renders an autofocused text field labelled `Type '<name>' to confirm` and keeps the `Delete` button disabled until the input matches exactly. The typed value resets whenever the dialog closes, so a reopened dialog always starts locked. Bulk actions use a count phrase as the name (`delete 12`), which scales the guard without listing every item.

## Choosing the tier

| Tier                         | When                                                                                                      | Example consumers                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Plain confirm (no guard)     | Routine, low-blast-radius deletes — a single message, draft, row, ban, webhook, role, or dashboard visual | Message/draft delete, file-table row delete, ban removal, role delete, dashboard visual delete |
| `confirmName` = entity name  | Irreversible container-level deletes where losing the wrong one is expensive                              | Resource delete, edit-form entity delete, room delete (type the room name)                     |
| `confirmName` = count phrase | Bulk destructive actions — the phrase encodes how many items are about to disappear                       | Resource list bulk delete (`delete 12`)                                                        |

## Key files

| File                                                                 | Role                                                                            |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `app/components/Styled/DeleteFormDialog.vue`                         | The shared dialog — red Delete button, `delete(onComplete)` emit, `confirmName` |
| `app/components/Styled/ConfirmDeleteDialogButton.vue`                | Icon-button activator + plain confirm, for toolbars                             |
| `app/components/Styled/EditFormDialog/ConfirmDeleteDialogButton.vue` | Edit-form entity delete — `confirmName` guard + copyable entity name            |
| `app/components/Resource/List/DeleteDialog.vue`                      | Singleton resource delete with `confirmName` = resource name                    |
| `app/components/Resource/List/SelectionToolbar.vue`                  | Bulk delete with `confirmName` = `delete <count>`                               |

## Notes

- No destructive button deletes on click — every one opens this dialog first. A button keeps its own styling by supplying the activator slot and calling `updateIsOpen(true)` (e.g. the role and dashboard-visual delete buttons wrap `StyledDeleteFormDialog` around their existing icon button rather than adopting `StyledConfirmDeleteDialogButton`'s look).
- List-item deletes mount the dialog once per list and target it through a dialog store — see [Singleton dialogs](/docs/architecture/singleton-dialogs).
- `StyledEditFormDialogConfirmCloseDialogButton` (save/discard/cancel on dirty close) is a three-action decision dialog, not a destructive confirmation — it stays outside this component on purpose.
