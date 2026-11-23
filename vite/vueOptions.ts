import type { VueOptions } from "vize";

import restrictedDateSyntaxes from "@esposter/configuration/eslint/restrictedDateSyntaxes.js";
import restrictedDeleteSyntaxes from "@esposter/configuration/eslint/restrictedDeleteSyntaxes.js";
import restrictedImageSyntaxes from "@esposter/configuration/eslint/restrictedImageSyntaxes.js";
import restrictedStoreSyntaxes from "@esposter/configuration/eslint/restrictedStoreSyntaxes.js";
import restrictedSyntaxes from "@esposter/configuration/eslint/restrictedSyntaxes.js";
import restrictedTrimSyntaxes from "@esposter/configuration/eslint/restrictedTrimSyntaxes.js";

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
  ],
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
      // A global style block (transition classes for slotted content, third-party DOM on the body) carries a disable
      // Comment with its reason; library CSS is a script-setup import, code-split with the component
      "vue/enforce-style-attribute": { allow: ["scoped"] },
      // The template's own selector bans; the script's are oxlint's
      "vue/no-restricted-syntax": [
        ...restrictedSyntaxes,
        ...restrictedTrimSyntaxes,
        {
          // The `unicorn/no-array-for-each`, `no-array-sort` and `no-array-reverse` rules oxlint ships cover the script and
          // Cannot see template expressions, so the same three bans are restated for the half they do not read. A mutating
          // Sort in a render expression rewrites the array it is rendering
          message:
            "Iterate with `v-for`, or move the loop into script/a computed — a template expression has no `for...of`, so `.forEach()` here has nowhere to go. Ordering takes the copying `toSorted()`/`toReversed()`: a render expression must not rewrite what it renders.",
          selector: "CallExpression[callee.property.name=/^(forEach|reverse|sort)$/]",
        },
        {
          // An `Object.*` call in a render expression allocates a fresh reference every render, which breaks prop reference
          // Equality and re-renders for nothing. An event handler runs per event, so it is exempt
          message:
            "Don't call Object.* inline in a template render expression — it allocates a new reference every render. Hoist it to a script-setup const (static) or computed (reactive). (Event handlers are exempt.)",
          selector: "CallExpression[callee.object.name='Object']:not(VAttribute[key.name.name='on'] CallExpression)",
        },
        {
          // An unconditional call at the start of a handler is what an event modifier expresses. A raw call stays allowed
          // Behind a runtime guard, which no modifier can encode
          message:
            "Use Vue event modifiers (@event.stop / @event.prevent, with key modifiers where applicable) instead of an unconditional event method call at the start of a handler. Raw calls are only for conditional use behind a guard.",
          selector:
            ":matches(VOnExpression, ArrowFunctionExpression > BlockStatement, FunctionExpression > BlockStatement) > ExpressionStatement:first-child > CallExpression[callee.property.name=/^(preventDefault|stopPropagation)$/], ArrowFunctionExpression > CallExpression[callee.property.name=/^(preventDefault|stopPropagation)$/]",
        },
        {
          // Vuetify's tags, which no package here provides. Only the kebab-case spelling is decidable, since a PascalCase
          // `V` prefix is also another library's own name
          message:
            "Don't use a Vuetify component. Draw it with the UI library's (`app/components/Ui`), or grow the library first — see openspec/specs/architecture/ui-library/design.md. An image is <NuxtImg>.",
          selector: "VElement[rawName=/^v-/]",
        },
        {
          // `vue/v-bind-style` reads only a bound argument, so the argument-less object form takes this ban
          message: 'Spread an object of bindings with the shorthand: `:="attrs"`, never `v-bind="attrs"`.',
          selector: "VAttribute[directive=true][key.name.rawName='bind'][key.argument=null]",
        },
        {
          // A bare reference forwards whatever the event hands it as the first argument, which the handler rarely means to
          // Read. A handler that wants the payload says so with an arrow
          message:
            'Call the handler instead of naming it: `@click="save()"`, or an arrow when it takes the payload — `@select="(id) => selectRole(id)"`.',
          selector:
            "VAttribute[directive=true][key.name.name='on'] > VExpressionContainer > :matches(Identifier, MemberExpression)",
        },
        // The three element bans are selectors rather than `vue/no-restricted-html-elements`, whose vize options name the
        // Elements and drop the message saying what to use instead
        // @TODO: https://github.com/ubugeeei-prod/vize/issues/13536 — move them to vue/no-restricted-html-elements once it takes a message
        {
          message:
            'Don\'t use a raw <a>. Use <NuxtLink :to> (internal), <NuxtLink :to external target> (external), <NuxtInvisibleLink :to="{ hash }"> (in-page anchor), or navigateTo for imperative navigation.',
          selector: "VElement[rawName='a']",
        },
        { message: "Don't use a raw <img>. Use <NuxtImg>.", selector: "VElement[rawName='img']" },
        {
          message: "Don't hand-write <time>. Use <NuxtTime>, which renders one and formats it hydration-safely.",
          selector: "VElement[rawName='time']",
        },
        ...restrictedDateSyntaxes,
        ...restrictedDeleteSyntaxes,
        ...restrictedImageSyntaxes,
        ...restrictedStoreSyntaxes,
      ],
      "vue/v-on-event-hyphenation": { autofix: true, style: "always" },
      "vue/v-slot-style": { atComponent: "shorthand" },
    },
    // The accessibility rules left off each wait on a design, never a markup fix. `click-events-have-key-events` and
    // `no-static-element-interactions` want a keyboard pattern per widget (a list of clickable cells takes one roving
    // Tabindex, not a tab stop each), `mouse-events-have-key-events` wants hover reveals to reveal on focus too, and
    // `media-has-caption` wants authored media, since every `<audio>` and `<video>` here plays an upload with no caption
    // Track. `no-autofocus` sees only an element's own attribute, so `restrictedSyntaxes.js` bans `autofocus` on any
    // Element, component or option instead. A rule is promoted with the work that earns it
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
