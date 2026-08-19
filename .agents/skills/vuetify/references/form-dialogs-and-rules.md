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

## A built-in rule first, a custom alias only where none covers the check

Reach for a Vuetify built-in (`required`, `maxLength`, `minLength`, `email`, `pattern`, `notEmpty`, …) before writing anything. They resolve their copy from `$vuetify.rules.*`, so a field validated by built-ins is worded like every other field in the app for free, and a hand-written English string next to them is a second source of rule copy that can never follow.

That applies to a rule bridging a server Zod schema too: a schema whose only constraints are "non-empty" and "at most N" is `[rules.required(), rules.maxLength(N)]` at the call site, not a `safeParse` wrapper surfacing the issue message. The bridge is earned only by a constraint no built-in expresses (a format, a cross-field invariant), and the app accepts the one gap that composition leaves — built-ins measure the raw input where the schema normalizes first, so whitespace-only input fails server-side rather than in the field.

A bespoke inline message is earned only when the generic one would be **wrong about what the user sees** — e.g. a length rule on a value composed from the field plus a suffix, where "You must enter a maximum of 2000 characters" contradicts a counter reading 100.

## Adding a custom global rule

Custom stateless/parameterized rules live in `app/rules.config.ts` (wired via `vuetify.moduleOptions.rulesConfiguration.configFile`). Add them as `aliases` builders (`(error) => (value) => …` or `(options, error) => (value) => …`, threading `error` for a caller-supplied message), end the file with `satisfies RulesOptions`, then call `rules.<name>(...)`. Name and word the alias in Vuetify's own voice — `minValue` beside `minLength`, `"You must enter a value of at least 5"` beside `"You must enter a minimum of 5 characters"`.

**Its message is a literal in the rule, not a `$vuetify.rules.*` entry** — matching the built-in's _wording_, not its lookup. Vuetify closes its own aliases over the locale instance but hands custom ones nothing, so routing a custom message through `t()` means declaring it under `locale.messages.en.rules` in `vuetify.config.ts` **plus `localeMessages: "en"`** (without that option the object replaces Vuetify's `en` outright and every built-in message disappears). That combination makes the module merge the whole `en` locale eagerly, which measurably slows every Vuetify mount — enough to push a marginal component test past its timeout. The app has no i18n ([deliberately deferred](/docs/architecture/deferred/i18n)), so that is a real cost for a translation nothing reads. Interpolate the literal instead:

```ts
minValue: (minimum, error) => (value: TextFieldValue) =>
  value === null || value === "" || Number(value) >= minimum || error || `You must enter a value of at least ${minimum}`,
```

**Test emptiness by equality, not by falsiness.** `TextFieldValue` is `null | number | string` because a `type="number"` field binds a numeric model and Vuetify hands the rule whatever that model holds — so `!value` reads a numeric `0` as an empty field and passes it, which is the one value a `minValue(1)` is most likely there to reject. A rule that genuinely only applies to text (`isNotProfanity`) says so with `typeof value !== "string"` instead.

Revisit when i18n lands: at that point the locale is being paid for anyway and these two aliases move into it.

Declare each alias's type in `app/types/vuetify.d.ts` so it gets autocomplete and option-type checking — use Vuetify's canonical builder helpers, not hand-rolled signatures:

```ts
import type { ValidationRuleBuilderWithOptions, ValidationRuleBuilderWithoutOptions } from "vuetify/labs/rules";

declare module "vuetify/labs/rules" {
  interface RuleAliases {
    myRule: ValidationRuleBuilderWithoutOptions; // (error?) => ValidationRule
    myRuleWithOption: ValidationRuleBuilderWithOptions<number>; // (option, error?) => ValidationRule
  }
}
```
