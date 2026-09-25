# Form dialogs, inline form errors and custom rules

Read when wiring a form dialog's or inline form's validity and error icon, or adding a custom global validation rule. The always-on rules — `isEditFormValid` naming, `useVRules()` declaration, never passing `!isEditFormValid` to `StyledFormDialog` — are in `SKILL.md`.

## The two dialog components

**`StyledFormDialog`** owns its form's `isValid` and its own `isSubmitting` and merges them into the confirm button internally (`isConfirmDisabled || !isValid`), along with the pending state:

```vue
<!-- only the consumer's own condition; form validity + submitting are already handled -->
<StyledFormDialog :is-confirm-disabled="selectedUserIds.length === 0 || undefined" />
```

**`StyledEditFormDialog`** (the edit family) takes **no** confirm condition at all — it takes `editedItem`, `schema`, `isDirty`, `isSavable`, `name` (what a delete must be confirmed with), `title` (the heading, which follows the edited name), `originalItem?`, and owns its save button (`EditFormDialog/SaveButton.vue`).

## The error icon

Use `StyledEditFormDialogErrorIcon` with `:edit-form :is-edit-form-valid` (plus optional `:schema :edited-value` for Zod validation). `editForm` is a required prop typed `InstanceType<typeof VForm> | undefined` — always passed, the `| undefined` reflecting the ref being uninitialized before mount. `isEditFormValid` is field-level only (from `<v-form v-model>`); schema errors are computed internally inside the icon.

## Inline forms (non-dialog)

For inline forms (slash command params, embedded editors), where a dialog's footer row does not exist to carry the state:

- Show `StyledEditFormDialogErrorIcon` in the form's header row, so validity is legible without reading every field.
- Name locals to match prop names so the `:edit-form :is-edit-form-valid` shorthands work.
- Ref the error icon to gate submit via `errorIcon.value?.isValid`.

The fields still report their own errors: `hideDetails: "auto"` reserves no row until there is a message, so the layout only grows when something is actually wrong, and suppressing that with `hide-details` is an eslint error (`vuetify` SKILL.md). The icon summarises; it does not replace what the field says.

```vue
<script setup lang="ts">
const editForm = useTemplateRef<InstanceType<typeof VForm>>("editForm");
const isEditFormValid = ref(true);
const errorIcon = useTemplateRef<InstanceType<typeof StyledEditFormDialogErrorIcon>>("errorIcon");
const disabled = computed(() => !(errorIcon.value?.isValid ?? true));
</script>

<div flex items-center gap-2>
  <StyledEditFormDialogErrorIcon ref="errorIcon" :edit-form :is-edit-form-valid />
</div>
<v-form ref="editForm" v-model="isEditFormValid">
  <v-text-field :rules="[rules.required()]" ... />
</v-form>
```

## A built-in rule first, a custom alias only where none covers the check

Reach for a Vuetify built-in (`required`, `maxLength`, `minLength`, `email`, `pattern`, `notEmpty`, …) before writing anything. They resolve their copy from `$vuetify.rules.*`, so a field validated by built-ins is worded like every other field in the app for free, and a hand-written English string next to them is a second source of rule copy that can never follow.

That applies to a rule bridging a server Zod schema too: a schema whose only constraints are "non-empty" and "at most N" is `[rules.required(), rules.maxLength(N)]` at the call site, not a `safeParse` wrapper surfacing the issue message. The bridge is earned only by a constraint no built-in expresses (a format, a cross-field invariant), and the app accepts the one gap that composition leaves — built-ins measure the raw input where the schema normalizes first, so whitespace-only input fails server-side rather than in the field.

A bespoke inline message is earned only when the generic one would be **wrong about what the user sees** — e.g. a length rule on a value composed from the field plus a suffix, where "You must enter a maximum of 2000 characters" contradicts a counter reading 100.

## Adding a custom rule

A rule no built-in covers is a builder in `UiRules` (`apps/web/app/services/ui/UiRules.ts`), worded in the library's one voice — the `ui-library` skill owns it.
