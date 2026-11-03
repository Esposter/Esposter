import type { NuxtConfig } from "nuxt/schema";

// Nuxt generates four standalone tsconfigs and none of them extends `tsconfig.base.json`, so what the workspace sets
// There is restated here, where `tsConfig` reaches all four. The `source` condition keeps the app from resolving every
// Sibling package through its `dist`, which would force every private package to emit declarations nothing else reads;
// It is spelled rather than imported because `nuxt prepare` loads this from `postinstall`, before
// `@esposter/configuration` is built, so `typescript.test.ts` holds the spelling to it. `noUnusedLocals` fails a
// `<script setup>` binding nothing reads, which no lint rule can see
// The Tiled tilesets are XML under `app/assets/`, where Nuxt's `app/**` include would compile them as TSX
// `vize` is the content mapper that turns `.vue` files into TypeScript for `tsrs -b`, and `useTemplateRef` is named as
// Vue's because the auto-import declaration is ambient
export const typescript: NuxtConfig["typescript"] = {
  tsConfig: {
    compilerOptions: { customConditions: ["source"], noUnusedLocals: true },
    // @TODO: no upstream issue — Nuxt types `tsConfig` without `contentMappers`, the key `tsrs` reads to compile `.vue` files
    // @ts-expect-error TS2353: `contentMappers` is not a known property of Nuxt's `tsConfig`
    contentMappers: [{ extensions: [".vue"], package: "vize" }],
    exclude: ["../app/assets/**/*.tsx"],
    vueCompilerOptions: { composables: { useTemplateRef: ["useTemplateRef"] } },
  },
};
