import type { VizeUnpluginOptions } from "@vizejs/unplugin";
import type { UserConfig } from "tsdown";

import { STYLESHEET_REQUEST_REGEX, VUE_AUTO_IMPORTS } from "#src/services/constants";
import { getTsdownConfiguration } from "#src/services/getTsdownConfiguration";
import { readPackageManifest } from "#src/services/readPackageManifest";
import Vize from "@vizejs/unplugin/rolldown";
import { mergeConfig } from "tsdown";
import AutoImport from "unplugin-auto-import/rolldown";

// The packages that ship `.vue` files build through tsdown like every other: Vize compiles the components, and
// `tsrs` generates the declarations with the content mapper the package's tsconfig names, so a `.vue` file is typed by
// The same pair that checks it. `vizeOptions` reaches the compiler, for a package whose templates hold elements a
// Renderer rather than Vue resolves, such as TresJS's `TresMesh`, which it names in `customElements`. Reaching rolldown
// Through vite would do the same two jobs behind a second build path, free to drift from this one.
//
// The program is the tsconfig's, and that is why this build alone names one: the package's `tsconfig.build.json` adds
// `tsconfig.build.base.json`'s excludes, so the tests stay out of the program, and `auto-imports.d.ts`, an ambient file
// No entrypoint imports, is in it through the tsconfig's own `include`. `runExternalCode` lets `tsrs` run the mapper.
// A private package keeps the base's `dts: false`, for the reason the base gives: nothing types against its `dist`.
export const getTsdownConfigurationVue = (vizeOptions: VizeUnpluginOptions = {}): UserConfig =>
  mergeConfig(getTsdownConfiguration({ exportsGeneration: "vue" }), {
    ...(readPackageManifest().private
      ? {}
      : { dts: { generator: "tsrs", tsconfig: "tsconfig.build.json", tsrs: { runExternalCode: true } } }),
    // A stylesheet is compiled into this package's own CSS, a sibling package's that a style block's `src` names
    // Included. Left external, the built JS would import a `.css` file that Node cannot load in a script
    deps: { alwaysBundle: [STYLESHEET_REQUEST_REGEX] },
    plugins: [AutoImport({ imports: [...VUE_AUTO_IMPORTS] }), Vize({ ...vizeOptions, isProduction: true })],
    // A component's stylesheet is emitted beside it and imported by its own module, so a consumer's bundler loads the
    // Styles of the components it reaches, and the package declares those imports as its only side effects. Split, the
    // Build writes no `./style.css`-shaped subpath for a stylesheet, which is reached through its module's import
    css: { inject: true, splitting: true },
  });
