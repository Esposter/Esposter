import type { VueOptions } from "vize";

import { BLOCKED_SPELLING_SYNTAXES } from "#vite/services/blockedSpellingSyntaxes";
import { SCOPED_STYLE_SYNTAXES } from "#vite/services/scopedStyleSyntaxes";
import { TEMPLATE_RESTRICTED_SYNTAXES } from "#vite/services/templateRestrictedSyntaxes";
import { IGNORE_PATTERNS } from "@esposter/configuration/oxfmt";

// The Vue rules, which vize's own lint runs over each whole component: oxlint reads only a component's script. The
// Incremental preset runs the rules listed here and nothing vize would add by default, so a rule is on because this map
// Names it
export const VUE_OPTIONS: VueOptions = {
  // A page, a layout and a server component render one root, which Nuxt's transitions and server islands need
  entries: [
    {
      files: ["**/app/components/**/*.server.vue", "**/app/layouts/**/*.vue", "**/app/pages/**/*.vue"],
      linter: { rules: { "vue/no-multiple-template-root": "error" } },
    },
    // A package styled by scoped CSS alone, whose native elements take no attribute HTML leaves undefined. An entry's
    // Options replace the base list rather than extend it, so it carries the template bans too
    {
      files: [
        "packages/genshin-interface/**/*.vue",
        "packages/genshin-world/**/*.vue",
        "packages/vue-phaserjs/**/*.vue",
      ],
      linter: {
        ruleOptions: { "vue/no-restricted-syntax": [...TEMPLATE_RESTRICTED_SYNTAXES, ...SCOPED_STYLE_SYNTAXES] },
      },
    },
    // The app is the one package UnoCSS styles, so its components take the spellings its blocklist refuses
    {
      files: ["apps/web/**/*.vue"],
      linter: {
        ruleOptions: { "vue/no-restricted-syntax": [...TEMPLATE_RESTRICTED_SYNTAXES, ...BLOCKED_SPELLING_SYNTAXES] },
      },
    },
  ],
  // `vize fmt` formats the components over the shared `fmt` block, this block winning a clash key by key. Oxfmt formats
  // Everything else and ignores them, so this list is the shared one without that entry. The attributes are left as
  // Written except `class`, which leads its run of static attributes, as the template order in the `vue` skill puts it
  fmt: {
    attributeGroups: [["class"], ["*"]],
    attributeSortOrder: "as-written",
    ignorePatterns: IGNORE_PATTERNS,
    sortAttributes: true,
  },
  linter: {
    preset: "incremental",
    ruleOptions: {
      // A `<NuxtTime>` always renders its date as text, so a heading that holds one — a calendar's month — has content
      "a11y/heading-has-content": { accessibleChildren: ["NuxtTime"] },
      // A component's macros stand at the top of its script, after the imports and the types they read. `defineExpose`
      // Stays out of the order, since the `vue` skill puts it before the watches and lifecycle hooks
      "script/define-macros-order": {
        order: ["defineOptions", "defineSlots", "defineModel", "defineProps", "defineEmits"],
      },
      // A tag is PascalCase as its component is named, every tag checked rather than only the registered ones. A `v-*`
      // Tag is the Vuetify ban's to report, and `component` and TresJS's `primitive` are built-ins spelt lowercase
      "vue/component-name-in-template-casing": {
        ignores: ["/^v-/", "component", "primitive"],
        registeredComponentsOnly: false,
      },
      // A global style block (transition classes for slotted content, third-party DOM on the body) carries a disable
      // Comment with its reason; library CSS is a script-setup import, code-split with the component
      "vue/enforce-style-attribute": { allow: ["scoped"] },
      // Each raw element the app renders through a component instead, with the component that replaces it
      "vue/no-restricted-html-elements": [
        {
          element: "a",
          message:
            'Don\'t use a raw <a>. Use <NuxtLink :to> (internal), <NuxtLink :to external target> (external), <NuxtInvisibleLink :to="{ hash }"> (in-page anchor), or navigateTo for imperative navigation.',
        },
        { element: "img", message: "Don't use a raw <img>. Use <NuxtImg>." },
        {
          element: "time",
          message: "Don't hand-write <time>. Use <NuxtTime>, which renders one and formats it hydration-safely.",
        },
      ],
      "vue/no-restricted-syntax": TEMPLATE_RESTRICTED_SYNTAXES,
      // A bind whose value is its own name is the shorthand: `:foo`, not `:foo="foo"`
      "vue/v-bind-style": ["shorthand", { sameNameShorthand: "always" }],
      "vue/v-on-event-hyphenation": { autofix: true, style: "always" },
      "vue/v-slot-style": { atComponent: "shorthand" },
    },
    // The accessibility rules left off each wait on a design, never a markup fix. `click-events-have-key-events` and
    // `no-static-element-interactions` want a keyboard pattern per widget (a list of clickable cells takes one roving
    // Tabindex, not a tab stop each), `mouse-events-have-key-events` wants hover reveals to reveal on focus too, and
    // `media-has-caption` wants authored media, since every `<audio>` and `<video>` here plays an upload with no
    // Caption track. `no-autofocus` sees only an element's own attribute, so `restrictedSyntaxes.js` bans `autofocus`
    // On any element, component or option instead. A rule is promoted with the work that earns it
    rules: {
      "a11y/alt-text": "error",
      "a11y/anchor-has-content": "error",
      "a11y/aria-props": "error",
      "a11y/aria-role": "error",
      "a11y/aria-unsupported-elements": "error",
      "a11y/form-control-has-label": "error",
      "a11y/heading-has-content": "error",
      "a11y/iframe-has-title": "error",
      "a11y/interactive-supports-focus": "error",
      "a11y/label-has-for": "error",
      "a11y/no-access-key": "error",
      "a11y/no-aria-hidden-on-focusable": "error",
      "a11y/no-distracting-elements": "error",
      "a11y/no-redundant-roles": "error",
      "a11y/no-role-presentation-on-focusable": "error",
      "a11y/role-has-required-aria-props": "error",
      "a11y/tabindex-no-positive": "error",
      // An import a component uses only as a type is `import type`, counting the template's uses, which oxlint's own
      // Rule cannot see
      "script/consistent-type-imports": "error",
      "script/define-macros-order": "error",
      "script/no-deprecated-dollar-listeners-api": "error",
      "script/no-deprecated-dollar-scopedslots-api": "error",
      "script/no-ref-as-operand": "error",
      "script/no-use-computed-property-like-method": "error",
      "script/one-component-per-file": "error",
      "script/order-in-components": "error",
      "script/require-explicit-emits": "error",
      "script/require-valid-default-prop": "error",
      "vue/attribute-hyphenation": "error",
      "vue/attribute-order": "error",
      "vue/comment-directive": "error",
      "vue/component-name-in-template-casing": "error",
      "vue/enforce-style-attribute": "error",
      "vue/html-end-tags": "error",
      "vue/jsx-uses-vars": "error",
      "vue/no-child-content": "error",
      "vue/no-deprecated-filter": "error",
      "vue/no-deprecated-functional-template": "error",
      "vue/no-deprecated-html-element-is": "error",
      "vue/no-deprecated-inline-template": "error",
      "vue/no-deprecated-router-link-tag-prop": "error",
      "vue/no-deprecated-scope-attribute": "error",
      "vue/no-deprecated-slot-attribute": "error",
      "vue/no-deprecated-slot-scope-attribute": "error",
      "vue/no-deprecated-v-bind-sync": "error",
      "vue/no-deprecated-v-is": "error",
      "vue/no-deprecated-v-on-native-modifier": "error",
      "vue/no-deprecated-v-on-number-modifiers": "error",
      "vue/no-dupe-v-else-if": "error",
      "vue/no-duplicate-attributes": "error",
      "vue/no-lone-template": "error",
      "vue/no-mutating-props": "error",
      "vue/no-restricted-html-elements": "error",
      "vue/no-restricted-syntax": "error",
      "vue/no-template-key": "error",
      "vue/no-template-shadow": "error",
      "vue/no-textarea-mustache": "error",
      "vue/no-unused-components": "error",
      "vue/no-use-v-if-with-v-for": "error",
      "vue/no-useless-template-attributes": "error",
      "vue/no-v-for-template-key-on-child": "error",
      "vue/require-component-is": "error",
      "vue/require-toggle-inside-transition": "error",
      "vue/require-v-for-key": "error",
      "vue/sfc-element-order": "error",
      "vue/this-in-template": "error",
      "vue/use-v-on-exact": "error",
      "vue/v-bind-style": "error",
      "vue/v-on-event-hyphenation": "error",
      "vue/v-on-style": "error",
      "vue/v-slot-style": "error",
      "vue/valid-attribute-name": "error",
      "vue/valid-v-bind": "error",
      "vue/valid-v-cloak": "error",
      "vue/valid-v-else": "error",
      "vue/valid-v-else-if": "error",
      "vue/valid-v-for": "error",
      "vue/valid-v-html": "error",
      "vue/valid-v-if": "error",
      "vue/valid-v-is": "error",
      "vue/valid-v-memo": "error",
      "vue/valid-v-model": "error",
      "vue/valid-v-on": "error",
      "vue/valid-v-once": "error",
      "vue/valid-v-pre": "error",
      "vue/valid-v-show": "error",
      "vue/valid-v-slot": "error",
      "vue/valid-v-text": "error",
    },
  },
};
