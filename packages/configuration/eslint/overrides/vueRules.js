export default {
  "@typescript-eslint/no-unused-vars": "off",
  "@typescript-eslint/unified-signatures": "off",
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
  ],
  // Object.* calls in a render-evaluated template expression (bind, v-for, interpolation) allocate a fresh
  // Reference every render, breaking prop reference-equality and forcing needless re-renders. Hoist to a
  // Script-setup const (static maps) or computed (reactive). Event handlers (@on) run per-event, so exempt.
  "vue/no-restricted-syntax": [
    "error",
    {
      message:
        "Don't call Object.* inline in a template render expression — it allocates a new reference every render. Hoist it to a script-setup const (static) or computed (reactive). (Event handlers are exempt.)",
      selector: "CallExpression[callee.object.name='Object']:not(VAttribute[key.name.name='on'] CallExpression)",
    },
    {
      // `router.replace({ query })` is a query-string update, not navigation, so only `push` is banned.
      message:
        "Use `navigateTo(target, { replace: true })` instead of `router.push` for navigation. (`router.replace({ query })` for query-only updates is fine.)",
      selector:
        "CallExpression[callee.property.name='push']:matches([callee.object.name=/^\\$?router$/], [callee.object.callee.name='useRouter'], [callee.object.property.name='$router'])",
    },
    {
      // An unconditional call at the start of a handler is exactly what Vue event modifiers express. Raw calls
      // Remain allowed after a runtime guard (e.g. only preventDefault when the cursor is at position 0), where
      // No modifier can encode the condition.
      message:
        "Use Vue event modifiers (@event.stop / @event.prevent, with key modifiers where applicable) instead of an unconditional event method call at the start of a handler. Raw calls are only for conditional use behind a guard.",
      selector:
        ":matches(VOnExpression, ArrowFunctionExpression > BlockStatement, FunctionExpression > BlockStatement) > ExpressionStatement:first-child > CallExpression[callee.property.name=/^(preventDefault|stopPropagation|stopImmediatePropagation)$/], ArrowFunctionExpression > CallExpression[callee.property.name=/^(preventDefault|stopPropagation|stopImmediatePropagation)$/]",
    },
    {
      // Vuetify's router integration is not Nuxt-native navigation and misbehaves in Nuxt — one pathway only.
      // `:to` bound form (`:to="x"`) — only NuxtLink/NuxtInvisibleLink/Teleport may take it.
      message: 'Use @click="navigateTo(...)" — :to is only allowed on NuxtLink/NuxtInvisibleLink/Teleport.',
      selector:
        "VElement[rawName!=/^(NuxtLink|NuxtInvisibleLink|Teleport)$/] > VStartTag > VAttribute[directive=true][key.argument.name='to']",
    },
    {
      // Static `to="..."` form — same rule.
      message: 'Use @click="navigateTo(...)" — :to is only allowed on NuxtLink/NuxtInvisibleLink/Teleport.',
      selector:
        "VElement[rawName!=/^(NuxtLink|NuxtInvisibleLink|Teleport)$/] > VStartTag > VAttribute[directive=false][key.name='to']",
    },
  ],
  "vue/no-unused-vars": "off",
  "vue/no-v-html": "off",
  "vue/no-v-text-v-html-on-component": "off",
  "vue/require-default-prop": "off",
  "vue/v-bind-style": ["error", "shorthand", { sameNameShorthand: "always" }],
  "vue/v-slot-style": ["error", { atComponent: "shorthand" }],
  "vue/valid-template-root": "off",
};
