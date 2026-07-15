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
  ],
  "vue/no-unused-vars": "off",
  "vue/no-v-html": "off",
  "vue/no-v-text-v-html-on-component": "off",
  "vue/require-default-prop": "off",
  "vue/v-bind-style": ["error", "shorthand", { sameNameShorthand: "always" }],
  "vue/v-slot-style": ["error", { atComponent: "shorthand" }],
  "vue/valid-template-root": "off",
};
