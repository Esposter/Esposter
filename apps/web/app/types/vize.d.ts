// @TODO: no upstream issue — vize's content mapper declares `__VLS_PROPS_FALLBACK` only in its shared helpers, and falls back to helpers embedded per file when the project's `vue` is not the one beside vize, which leaves a library component's undeclared attribute rejected; drop this once the embedded helpers declare it
/* oxlint-disable no-implicit-globals, no-underscore-dangle, no-var -- the mapper reads this exact global name, declared as a global var */
declare var __VLS_PROPS_FALLBACK: Record<string, unknown>;
