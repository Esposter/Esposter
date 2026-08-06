# Form dialogs, inline form errors and custom rules

Read when wiring a form dialog's or inline form's validity and error icon, or adding a custom global validation rule. The always-on rules — `isEditFormValid` naming, `useVRules()` declaration, never passing `!isEditFormValid` to `StyledFormDialog` — are in `SKILL.md`.

## The two dialog components

**`StyledFormDialog`** owns its own `isEditFormValid` and `isSubmitting` and merges them into the confirm button internally (`disabled: Boolean(confirmButtonAttrs.disabled) || !isEditFormValid || isSubmitting`), along with `type="submit"`, `form` and `loading`:

```vue
<!-- only the consumer's own condition; form validity + submitting are already handled -->
<StyledFormDialog :confirm-button-attrs="{ disabled: selectedUserIds.length === 0 }" />
```

**`StyledEditFormDialog`** (the Save & Close family) has **no** `confirmButtonAttrs` at all — it takes `editedItem`, `schema`, `isDirty`, `isEditFormValid`, `isSavable`, `name`, `originalItem?`, and owns its save button (`EditFormDialog/SaveButton.vue`).

## The error icon

Use `StyledEditFormDialogErrorIcon` with `:edit-form :is-edit-form-valid` (plus optional `:schema :edited-value` for Zod validation). `editForm` is a required prop typed `InstanceType<typeof VForm> | undefined` — always passed, the `| undefined` reflecting the ref being uninitialized before mount. `isEditFormValid` is field-level only (from `<v-form v-model>`); schema errors are computed internally inside the icon.

## Inline forms (non-dialog)

For inline forms (slash command params, embedded editors) where inline validation errors would break the layout:

- Add `hide-details` to all `v-text-field`/`v-textarea` inputs.
- Show `StyledEditFormDialogErrorIcon` in the form's header row instead.
- Name locals to match prop names so the `:edit-form :is-edit-form-valid` shorthands work.
- Ref the error icon to gate submit via `errorIcon.value?.isValid`.

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
  <v-text-field :rules="[rules.required()]" hide-details ... />
</v-form>
```

## Adding a custom global rule

Custom stateless/parameterized rules live in `app/rules.config.ts` (wired via `vuetify.moduleOptions.rulesConfiguration.configFile`). Add them as `aliases` builders (`(err) => (value) => …` or `(options, err) => (value) => …`, threading `err` for a caller-supplied message), end the file with `satisfies RulesOptions`, then call `rules.<name>(...)`.

Declare each alias's type in `app/types/vuetify.d.ts` so it gets autocomplete and option-type checking — use Vuetify's canonical builder helpers, not hand-rolled signatures:

```ts
import type { ValidationRuleBuilderWithOptions, ValidationRuleBuilderWithoutOptions } from "vuetify/labs/rules";

declare module "vuetify/labs/rules" {
  interface RuleAliases {
    myRule: ValidationRuleBuilderWithoutOptions; // (err?) => ValidationRule
    myRuleWithOption: ValidationRuleBuilderWithOptions<number>; // (option, err?) => ValidationRule
  }
}
```
