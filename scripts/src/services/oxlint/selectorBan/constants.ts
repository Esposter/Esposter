// Every script oxlint reads a selector ban over: a module and a component's script blocks
export const SCRIPT_FILES: string[] = ["**/*.ts", "**/*.vue"];
// A suite, a type test or a bench keeps the fixtures a source file may not
export const TEST_FILE_PATTERNS: string[] = ["**/*.bench.ts", "**/*.test-d.ts", "**/*.test.ts"];
// The packages held to the app's Vue conventions: the app, and the three packages written in its components' shape.
// Every other package is a library of plain modules, which takes the script bans alone
export const VUE_PACKAGES = "{apps/web,packages/genshin-interface,packages/genshin-world,packages/vue-phaserjs}";
