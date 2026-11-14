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
  // Nuxt includes each local module's whole `runtime/server` folder, tests too; a package's tests are its own program's,
  // Typechecked by the package against its own globals, which the Workers ones would change here
  serverTsConfig: {
    compilerOptions: { types: ["@cloudflare/workers-types"] },
    exclude: ["../../../packages/*/src/runtime/**/*.test.ts", "../../../packages/*/src/runtime/**/*.test-d.ts"],
  },
  // Nuxt's app program includes `app/**` but its shared program does not, and both reach server modules through the
  // Router's types, so the shared one names the `cloudflare:workers` declaration the app holds (`tsconfig.root.json` does too)
  sharedTsConfig: { include: ["../app/types/cloudflareWorkers.d.ts"] },
  // The Workers globals are the server's alone, because loaded into the browser program their `Request` and `Response`
  // Replace the DOM's, so the server tsconfig names the package and the app and shared code never see it
  tsConfig: {
    compilerOptions: { customConditions: ["source"], noUnusedLocals: true },
    contentMappers: [{ extensions: [".vue"], package: "vize" }],
    exclude: ["../app/assets/**/*.tsx"],
    vueCompilerOptions: { composables: { useTemplateRef: ["useTemplateRef"] } },
  },
};
// Nuxt gives the server the webworker and DOM libs, which declare the same `Headers` and `Response` as the Workers globals.
// `defu` concatenates a config's arrays rather than replacing them, so `serverTsConfig` cannot take them away.
// The hook sets the server's lib once Nuxt has computed it
export const typescriptHooks: NuxtConfig["hooks"] = {
  "prepare:types": ({ serverTsConfig }) => {
    serverTsConfig.compilerOptions = { ...serverTsConfig.compilerOptions, lib: ["ESNext"] };
  },
};
