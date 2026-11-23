import type { SelectorBanList } from "#src/models/oxlint/selectorBan/SelectorBanList";

import { VUE_PACKAGES } from "#src/services/oxlint/selectorBan/constants";

// `<script setup>` is the only component authoring style here. Nuxt 5 compiles the Options API runtime out of the
// Bundle (`vue.optionsApi` off), so an options component would mount against a runtime that cannot apply it and fail at
// Render Rather than at build. Plain `defineComponent(...)` goes with it: it buys nothing script setup does not, and
// Leaving it Allowed is what lets an options block back in one property at a time
const MESSAGE =
  "Author the component in `<script setup>` — the Options API runtime is compiled out, and `defineComponent` buys nothing script setup does not. See the vue skill.";

export const RESTRICTED_COMPONENT_API_SYNTAXES: SelectorBanList = {
  bans: [
    { message: MESSAGE, selector: "ExportDefaultDeclaration > ObjectExpression" },
    { message: MESSAGE, selector: "CallExpression[callee.name='defineComponent']" },
  ],
  files: [`${VUE_PACKAGES}/**/*.vue`],
};
