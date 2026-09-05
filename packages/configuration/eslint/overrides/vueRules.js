import restrictedDateSyntaxes from "@esposter/configuration/eslint/restrictedDateSyntaxes.js";
import restrictedStoreSyntaxes from "@esposter/configuration/eslint/restrictedStoreSyntaxes.js";
import restrictedSyntaxes from "@esposter/configuration/eslint/restrictedSyntaxes.js";

// The Vuetify inputs `vuetify.config.ts` declares `hideDetails: "auto"` for. Shared by the two halves of the
// `hide-details` ban below so the static and bound forms can never cover different tags. A component missing from
// This list is caught by neither, which is the failure to watch for: adding an input to `vuetify.config.ts` means
// Adding it here in the same change, or its instances may quietly restate the default.
const VUETIFY_INPUT_ELEMENT_REGEX =
  "/^v-(autocomplete|checkbox|color-input|combobox|file-input|radio-group|select|slider|switch|textarea|text-field)$/";

export default {
  // Not covered by eslint-plugin-oxlint on vue files — its vue-svelte-astro-exceptions config
  // Deliberately keeps unused-vars rules enabled there, so this off is still load-bearing.
  "@typescript-eslint/no-unused-vars": "off",
  // `<script setup>` is the only component authoring style here. The Options API runtime is compiled out of the
  // Bundle entirely (`future.compatibilityVersion: 5` defaults `vue.optionsApi` off), so an options component of
  // Ours would mount against a runtime that cannot apply it and fail at render rather than at build. Plain
  // `defineComponent(...)` composition is banned with it: it buys nothing script setup does not, and leaving it
  // Allowed is what lets an options block back in one property at a time.
  "vue/component-api-style": ["error", ["script-setup"]],
  // PascalCase for our components and PascalCase third-party (VueFlow, VuePdfEmbed); kebab-case is only for
  // Third-party libraries that ship kebab tags (Vuetify's v-*) and TresJS's lowercase <primitive> special
  // Element. registeredComponentsOnly is useless under Nuxt auto-imports (nothing is locally registered),
  // So check every non-HTML tag.
  "vue/component-name-in-template-casing": [
    "error",
    "PascalCase",
    { ignores: ["/^v-/", "primitive"], registeredComponentsOnly: false },
  ],
  // Styles are scoped by default; the rare global block (e.g. transition classes for slotted content,
  // Third-party DOM appended to document.body) carries an eslint-disable with its reason. Library CSS
  // Belongs in a script-setup `import "lib.css"` (code-split with the component), not a global style block.
  "vue/enforce-style-attribute": ["error", { allow: ["scoped"] }],
  "vue/html-self-closing": "off",
  "vue/multi-word-component-names": "off",
  // Raw <a> bypasses client-side routing (full reloads) and default link styles. Use <NuxtLink :to> for internal
  // Routes, <NuxtLink :to external target> for external URLs, <NuxtInvisibleLink :to="{ hash }"> for in-page anchors,
  // And navigateTo for imperative navigation.
  "vue/no-restricted-html-elements": [
    "error",
    {
      element: "a",
      message:
        'Don\'t use a raw <a>. Use <NuxtLink :to> (internal), <NuxtLink :to external target> (external), <NuxtInvisibleLink :to="{ hash }"> (in-page anchor), or navigateTo for imperative navigation.',
    },
    {
      element: "v-img",
      message:
        "Don't use <v-img>. It gates its render on an IntersectionObserver that only exists in the browser, so it renders on the server and not on hydration. Use <NuxtImg>, sizing it with CSS utilities (its width/height props are html attributes for the optimizer, not styles) and stating object-contain/object-cover wherever both dimensions are constrained.",
    },
    {
      element: "img",
      message: "Don't use a raw <img>. Use <NuxtImg>.",
    },
    {
      element: "time",
      message: "Don't hand-write <time>. Use <NuxtTime>, which renders one and formats it hydration-safely.",
    },
  ],
  // Every input Vuetify renders in this app declares `hideDetails: "auto"` once in `vuetify.config.ts`, so a
  // Per-field `hide-details` restates the default at best and defeats it at worst: the bare attribute means
  // `true`, which silently swallows the validation message a field with rules exists to report. The bound form
  // Is banned beside it in `vue/no-restricted-syntax` — a binding there computes what "auto" already answers
  // Per render.
  "vue/no-restricted-static-attribute": [
    "error",
    {
      element: VUETIFY_INPUT_ELEMENT_REGEX,
      key: "hide-details",
      message:
        'Don\'t write `hide-details` on a Vuetify input — `vuetify.config.ts` already declares `hideDetails: "auto"` for it. The bare attribute is `true`, which hides the validation message a field with rules has to show.',
    },
  ],
  // Object.* calls in a render-evaluated template expression (bind, v-for, interpolation) allocate a fresh
  // Reference every render, breaking prop reference-equality and forcing needless re-renders. Hoist to a
  // Script-setup const (static maps) or computed (reactive). Event handlers (@on) run per-event, so exempt.
  "vue/no-restricted-syntax": [
    "error",
    ...restrictedSyntaxes,
    {
      // The `unicorn/no-array-for-each`, `no-array-sort` and `no-array-reverse` rules oxlint ships cover the
      // Script block and cannot see template expressions, so the same three bans are restated here for the
      // Half it does not read.
      // A mutating sort in a render expression is worse than in script: it rewrites the array it is rendering.
      // The fourth of the set — splicing a fresh copy — is in `restrictedSyntaxes` instead, because no oxlint
      // Rule covers either half of it, so one entry there reaches script and template alike.
      message:
        "Iterate with `v-for`, or move the loop into script/a computed — a template expression has no `for...of`, so `.forEach()` here has nowhere to go. Ordering takes the copying `toSorted()`/`toReversed()`: a render expression must not rewrite what it renders.",
      selector: "CallExpression[callee.property.name=/^(forEach|reverse|sort)$/]",
    },
    {
      message:
        "Don't call Object.* inline in a template render expression — it allocates a new reference every render. Hoist it to a script-setup const (static) or computed (reactive). (Event handlers are exempt.)",
      selector: "CallExpression[callee.object.name='Object']:not(VAttribute[key.name.name='on'] CallExpression)",
    },
    {
      // An unconditional call at the start of a handler is exactly what Vue event modifiers express. Raw calls
      // Remain allowed after a runtime guard (e.g. only preventDefault when the cursor is at position 0), where
      // No modifier can encode the condition.
      message:
        "Use Vue event modifiers (@event.stop / @event.prevent, with key modifiers where applicable) instead of an unconditional event method call at the start of a handler. Raw calls are only for conditional use behind a guard.",
      selector:
        ":matches(VOnExpression, ArrowFunctionExpression > BlockStatement, FunctionExpression > BlockStatement) > ExpressionStatement:first-child > CallExpression[callee.property.name=/^(preventDefault|stopPropagation)$/], ArrowFunctionExpression > CallExpression[callee.property.name=/^(preventDefault|stopPropagation)$/]",
    },
    {
      // The static form is banned in `vue/no-restricted-static-attribute`; this is the same ban for the bound
      // One. A binding here computes what "auto" already answers per render — no row when there is no message,
      // A row when there is — so the condition is either that rule restated or a field deliberately suppressing
      // Its own validation message.
      message:
        'Don\'t bind `:hide-details`. `vuetify.config.ts` declares `hideDetails` as "auto" for every input, which already hides the details row exactly when there is no message to show.',
      selector: `VElement[rawName=${VUETIFY_INPUT_ELEMENT_REGEX}] > VStartTag > VAttribute[directive=true][key.name.name='bind'][key.argument.name='hide-details']`,
    },
    ...restrictedDateSyntaxes,
    ...restrictedStoreSyntaxes,
  ],
  "vue/no-unused-vars": "off",
  "vue/no-v-html": "off",
  "vue/no-v-text-v-html-on-component": "off",
  "vue/padding-line-between-blocks": ["error", "always"],
  // Load-bearing, and a pair with the `"off"` in `.oxlintrc.json` rather than a duplicate of it.
  // `eslint-plugin-oxlint` emits a disable for every rule in an enabled category and then deletes that disable
  // Again for any rule the config deactivates — it only switches off the twins of rules oxlint actually runs.
  // So dropping this half as redundant turns the rule back on in ESLint alone, on a tree oxlint passes clean.
  "vue/require-default-prop": "off",
  "vue/v-bind-style": ["error", "shorthand", { sameNameShorthand: "always" }],
  "vue/v-slot-style": ["error", { atComponent: "shorthand" }],
  "vue/valid-template-root": "off",
};
