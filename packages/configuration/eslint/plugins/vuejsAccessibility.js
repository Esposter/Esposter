import vuejsAccessibility from "eslint-plugin-vuejs-accessibility";
import { defineConfig } from "eslint/config";
/** @type {import("@eslint/core").ConfigObject} */
const config = vuejsAccessibility.configs["flat/recommended"][1];
// Only `files`, `plugins` and `rules` are taken from the plugin's flat config. Its `languageOptions` sets
// `parser: vue-eslint-parser` with no `parserOptions.parser`, which would override the Nuxt config's TS
// Sub-parser and turn every `<script setup lang="ts">` into a parse error.
export default defineConfig({
  files: config.files,
  plugins: config.plugins,
  rules: {
    ...config.rules,
    // A raw `<div @click>` needs `role` + `tabindex` + a key handler to satisfy these, and adding a tab stop
    // Per clickable element is a design decision, not a markup fix — a list of reaction pills or sheet cells
    // Needs a roving-tabindex composite, not one tab stop each. Promote each once its widgets have a keyboard
    // Pattern. Both also misfire on a Vue component nested inside `<svg>` (SVG namespace defeats their
    // `isCustomComponent` check) and on `role="separator"`, which is focusable but not an "interactive role".
    "vuejs-accessibility/click-events-have-key-events": "off",
    // Every `<audio>`/`<video>` renders a user-uploaded file, which has no caption track to attach, and the
    // Elements are single template roots that a disable comment would turn into fragments. Promote it when the
    // App ships authored media that could carry captions.
    "vuejs-accessibility/media-has-caption": "off",
    // Hover-reveal toolbars would have to reveal on `@focusin`/`@focusout` too. That is a visible behaviour
    // Change per surface, so promote it with the reveal work rather than ahead of it.
    "vuejs-accessibility/mouse-events-have-key-events": "off",
    "vuejs-accessibility/no-aria-hidden-on-focusable": "error",
    // `ignoreNonDOM` is the rule's own schema default, which ESLint never applies. Without it the rule fires on
    // Every `autofocus` *prop* of a Vuetify/local component, where it cannot see what element receives focus.
    "vuejs-accessibility/no-autofocus": ["error", { ignoreNonDOM: true }],
    "vuejs-accessibility/no-onchange": "error",
    "vuejs-accessibility/no-role-presentation-on-focusable": "error",
    "vuejs-accessibility/no-static-element-interactions": "off",
  },
});
