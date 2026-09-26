# Dialog Stores

Read when a singleton dialog needs a target — a deleting id, an editing name — or a dialog store is being created.

Singleton-dialog targets (`deletingId`, `editingFooName`, …) never live in a business-logic store — each service gets a dedicated dialog store beside its business store: `store/<feature>/dialog.ts` → `use<Feature>DialogStore` when a feature folder exists, otherwise `<feature>Dialog.ts` beside the business store file (`store/<feature>/fooDialog.ts` → `useFooDialogStore`).

Targets are strings defaulting to `""` (never `undefined`), and components derive `v-model` from them via `useSingletonDialog`. Full pattern: the Singleton Dialogs section in the `vue-page-composition` skill and `apps/web/content/docs/architecture/singleton-dialogs.md`.
