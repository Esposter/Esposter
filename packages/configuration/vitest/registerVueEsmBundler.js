import { registerHooks } from "node:module";

// The app compiles the Options API out (`future.compatibilityVersion: 5`), and every test must run the same Vue. Node
// Resolves `vue` to its CommonJS build, which has the Options API compiled in whatever the flag says, so an Options API
// Component passes a test and throws in the app. `getVueTestConfiguration` loads this into every worker before
// Anything imports Vue, and it sends every Vue runtime entry, imported or required, bare or already resolved, to
// Its `esm-bundler` build, which reads the flags below. Every importer then shares that one copy of Vue
Object.assign(globalThis, {
  __VUE_OPTIONS_API__: false,
  __VUE_PROD_DEVTOOLS__: false,
  __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
});

const VUE_COMMONJS_ENTRY_REGEX =
  /\/node_modules\/(?<name>vue|@vue\/(?:reactivity|runtime-core|runtime-dom|shared))\/(?:index\.m?js|dist\/[\w-]+\.cjs(?:\.prod)?\.js)$/u;

registerHooks({
  resolve: (specifier, context, nextResolve) => {
    const result = nextResolve(specifier, context);
    const name = VUE_COMMONJS_ENTRY_REGEX.exec(result.url)?.groups?.name;
    if (!name) return result;
    const buildName = name === "vue" ? "vue.runtime" : name.slice("@vue/".length);
    return {
      ...result,
      format: "module",
      url: result.url.replace(VUE_COMMONJS_ENTRY_REGEX, `/node_modules/${name}/dist/${buildName}.esm-bundler.js`),
    };
  },
});
