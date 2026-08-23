import type { UserConfig } from "tsdown";

import { mergeConfig } from "tsdown";

import { BUILD_TSCONFIG } from "./constants.ts";
import { getPackagePatterns } from "./getPackagePatterns.ts";
import { readPackageManifest } from "./readPackageManifest.ts";

// The base every package's `tsdown.config.ts` calls. tsdown already defaults `entry` to `src/index.ts`,
// `outDir` to `dist`, `format` to `esm` and `clean` to true, so none of those are restated here.
//
// Compose these factories with `mergeConfig`, never by spreading one into an object literal. A spread replaces
// A key outright, so a config that adds one `deps` or `dts` field silently drops every other field the base
// Set on it — `mergeConfig` merges into them instead.
//
// Whether a package is published is the only thing that changes the shape of a build, so it is asked once. A
// Published package owes an installable promise to a stranger, and the three options below are the gates that
// Hold it to that promise. A private package owes nobody anything and gets none of them.
//
// What a private package deliberately does NOT get is `exports.devExports`, which would point its exports at
// `src` so a workspace consumer never had to wait for a rebuild. Every package here resolves its own source
// Through the `@/*` path alias, and that alias is relative to whichever package the build is running in — so
// The moment a sibling bundles this package from source, its internal `@/...` imports resolve into the
// Bundling package instead and vanish. `azure-functions` and `azure-mock` both vendor siblings, so source
// Exports are not available to this repo while that alias convention stands.
export const getTsdownConfiguration = (): UserConfig => {
  const { dependencies, optionalDependencies, peerDependencies, private: isPrivate } = readPackageManifest();
  // `platform: "neutral"` is the real "no platform assumption": tsdown defaults to `node`, which would let a
  // Package reach for a node builtin without the build ever objecting. A package that genuinely targets node
  // Says so with `getTsdownConfigurationNode`.
  const commonConfiguration = {
    // Tsdown otherwise hints on every build that an allowlist of what may be inlined is missing. The list it
    // Asks for already exists: tsdown itself writes every vendored package into the manifest's
    // `inlinedDependencies`, which is committed, so a newly inlined package lands in a reviewed diff. A second
    // Hand-maintained copy could only ever be bootstrapped by hand-writing the versions tsdown generates — the
    // Check runs before the manifest is written, so a first build of a new package could never pass.
    deps: { onlyBundle: false },
    dts: { tsconfig: BUILD_TSCONFIG },
    // Generated rather than hand-written, so a new entrypoint cannot ship without the manifest reaching it.
    exports: true,
    // Every package here is `"type": "module"`, so a `.js` file is already unambiguously ESM and the `.mjs`
    // Tsdown defaults to on the node platform buys nothing — it only makes the output path differ between the
    // Node packages and the neutral ones.
    fixedExtension: false,
    platform: "neutral",
    tsconfig: BUILD_TSCONFIG,
  } satisfies UserConfig;
  return isPrivate
    ? commonConfiguration
    : mergeConfig(commonConfiguration, {
        // Declarations are consumed through whatever resolution mode the consumer picked, so they are checked
        // Against all of them. `esm-only` rather than `node16`: every package here is `"type": "module"` with
        // No CJS output, and the stricter profiles fail on a dual-format contract we do not offer.
        attw: { level: "error", profile: "esm-only" },
        // A published bundle may import only what its own manifest tells the consumer to install. A private
        // Sibling left as an import is unresolvable for anyone installing from npm, and invisible until they
        // Try — this turns that into a build failure instead.
        deps: {
          onlyImport: getPackagePatterns([
            ...Object.keys(dependencies ?? {}),
            ...Object.keys(optionalDependencies ?? {}),
            ...Object.keys(peerDependencies ?? {}),
          ]),
        },
        // Publishability is a build-time error rather than a release-time surprise: this fails a build whose
        // Manifest points at a file it does not ship.
        publint: { level: "error" },
      });
};
