import restrictedSyntaxes from "@esposter/configuration/eslint/restrictedSyntaxes.js";

export default {
  // Not covered by eslint-plugin-oxlint on vue files — its vue-svelte-astro-exceptions config
  // Deliberately keeps unused-vars rules enabled there, so this off is still load-bearing.
  "@typescript-eslint/no-unused-vars": "off",
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
  ],
  // Object.* calls in a render-evaluated template expression (bind, v-for, interpolation) allocate a fresh
  // Reference every render, breaking prop reference-equality and forcing needless re-renders. Hoist to a
  // Script-setup const (static maps) or computed (reactive). Event handlers (@on) run per-event, so exempt.
  "vue/no-restricted-syntax": [
    "error",
    ...restrictedSyntaxes,
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
  ],
  "vue/no-unused-vars": "off",
  "vue/no-v-html": "off",
  "vue/no-v-text-v-html-on-component": "off",
  "vue/padding-line-between-blocks": ["error", "always"],
  "vue/require-default-prop": "off",
  "vue/v-bind-style": ["error", "shorthand", { sameNameShorthand: "always" }],
  "vue/v-slot-style": ["error", { atComponent: "shorthand" }],
  "vue/valid-template-root": "off",
};
