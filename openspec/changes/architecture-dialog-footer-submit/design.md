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

- **Compose the form shell where the footer is only the shell's.** A dialog whose footer is Cancel and one submit takes `StyledFormDialog`, which already owns the pairing. Rejected as the only route: a dialog whose footer carries more than the shell's confirm, such as Notes, would lose its own actions.
- **The base dialog takes the binding for a footer it does not draw.** A footer-submit binding on the base dialog hands the id to its footer slot, so a dialog with its own footer names the form without a `useId`. Rejected: a generated id in each dialog, which is the copy this change removes.
- **The choice between the two is made in review of this change.** Both routes remove the copies. The owner picks the route before the tasks run, since the first changes which dialogs compose the shell.

## Key files

| Source                                          | Role                                                  |
| :---------------------------------------------- | :---------------------------------------------------- |
| `apps/web/app/components/Styled/FormDialog.vue` | Generates the form id the shell's confirm uses        |
| `apps/web/app/components/Styled/Dialog.vue`     | Binds the confirm button's `form` and the footer slot |
