# Footer submit

A dialog whose footer submits its form gets the form id from the shell, so no dialog declares its own id for the footer to name.

## Why

The shell already binds the submit for a dialog that composes it: `StyledFormDialog` generates the id and `Styled/Dialog.vue` puts it on the confirm button. Five dialogs do not compose it, and each restates the pairing:

| File                                                                        | Footer                |
| :-------------------------------------------------------------------------- | :-------------------- |
| `apps/web/app/components/Message/Model/Member/ActionDialog/Shell.vue`       | Cancel and the submit |
| `apps/web/app/components/Message/Model/Member/ActionDialog/DisplayName.vue` | Save                  |
| `apps/web/app/components/Message/Model/Member/ActionDialog/Notes.vue`       | the add-note submit   |
| `apps/web/app/components/Resource/Blueprint/DeployDialog.vue`               | the deploy submit     |
| `apps/web/app/components/Resource/ShareDialog.vue`                          | the share submit      |

## Decisions

- **The base dialog hands one generated id to both its body and its footer, as a slot prop named `formId`.** A dialog that draws its own footer writes `#default="{ formId }"` on the form and `#footer="{ formId }"` on the submit, so it names the form without a `useId`. One mechanism serves all five dialogs, whatever their footer holds.
- **Rejected: composing `StyledFormDialog` for the dialogs.** It draws Cancel beside one confirm and leaves no place for another footer action. The notes dialog has no Cancel, and its add-note submit keeps the dialog open, so the shell would change what it shows. The shell also needs a submit that answers and closes, which an add-note does not.
- **Rejected: a generated id in each dialog.** That is the copy this change removes.
- **`StyledFormDialog` keeps the id it already generates.** It passes the id to the styled shell as a prop and draws no footer of its own through the slot, so it has no copy of the pairing to remove.

## Key files

| Source                                          | Role                                                  |
| :---------------------------------------------- | :---------------------------------------------------- |
| `apps/web/app/components/Styled/FormDialog.vue` | Generates the form id the shell's confirm uses        |
| `apps/web/app/components/Styled/Dialog.vue`     | Binds the confirm button's `form` and the footer slot |
