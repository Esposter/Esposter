export default {
  "vue/no-unused-vars": "off",
  "vue/no-v-html": "off",
  "vue/no-v-text-v-html-on-component": "off",
  "vue/multi-word-component-names": "off",
  "vue/valid-template-root": "off",
  "vue/v-bind-style": ["error", "shorthand" , {
    // @TODO: Update this to "always" once vue-tsc can be properly upgraded to v2
    "sameNameShorthand": "never"
  }],
  "@typescript-eslint/no-unused-vars": "off",
};
