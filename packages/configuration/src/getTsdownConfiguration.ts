import type { UserConfig } from "tsdown";

import { mergeConfig } from "tsdown";

import { BUILD_TSCONFIG, SOURCE_CONDITION } from "./constants.ts";
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
// Published package owes an installable promise to a stranger, and `publint` and `attw` are the gates that
// Hold it to that promise. A private package owes nobody anything and gets neither.
export const getTsdownConfiguration = (): UserConfig => {
  const {
    dependencies,
    optionalDependencies,
    peerDependencies,
    peerDependenciesMeta,
    private: isPrivate,
  } = readPackageManifest();
  // `platform: "neutral"` is the real "no platform assumption": tsdown defaults to `node`, which would let a
  // Package reach for a node builtin without the build ever objecting. A package that genuinely targets node
  // Says so with `getTsdownConfigurationNode`.
  const commonConfiguration = {
    // `onlyBundle: false` silences tsdown's standing hint that an allowlist of what may be inlined is missing.
    // The list it asks for already exists: tsdown itself writes every vendored package into the manifest's
    // `inlinedDependencies`, which is committed, so a newly inlined package lands in a reviewed diff. A second
    // Hand-maintained copy could only ever be bootstrapped by hand-writing the versions tsdown generates — the
    // Check runs before the manifest is written, so a first build of a new package could never pass.
    //
    // `onlyImport` is the mirror gate: a bundle may leave external only what its own manifest names. For a
    // Published package that is an installability promise — a private sibling left as an import resolves
    // Nothing on a stranger's `npm install`, and every local check passes because the workspace has it on
    // Disk. For a private one it catches the specifier that resolved to nothing: rolldown externalizes an
    // Unresolvable `#src/...` rather than failing, so the built `dist` ships an import Node then resolves
    // Through the manifest's own `imports` map to a `.ts` file it cannot load — a failure that surfaces in a
    // Consumer at runtime, naming a source path that consumer never referenced.
    deps: {
      onlyBundle: false,
      onlyImport: getPackagePatterns([
        ...Object.keys(dependencies ?? {}),
        ...Object.keys(optionalDependencies ?? {}),
        ...Object.keys(peerDependencies ?? {}),
        ...Object.keys(peerDependenciesMeta ?? {}),
      ]),
    },
    dts: { tsconfig: BUILD_TSCONFIG },
    // Generated rather than hand-written, so a new entrypoint cannot ship without the manifest reaching it.
    //
    // `devExports` gives every generated entry a second arm under `SOURCE_CONDITION` pointing at `src`, so a
    // Tool that opts into that condition — the tsconfig preset, the shared Vitest config — resolves this
    // Package's TypeScript directly and no rebuild stands between an edit and a consumer seeing it. It is the
    // Condition name rather than `true` on purpose: `true` drops the `default` arm and points every condition
    // At source, which hands Node's own ESM loader TypeScript it cannot read.
    //
    // This only holds because every package addresses its own source through the `#src/*` subpath imports its
    // Own manifest declares. A `paths` alias resolves relative to whichever tsconfig is compiling, so a
    // Sibling bundling this package from source would resolve its internal specifiers into itself; a subpath
    // Import resolves against the manifest that wrote it no matter who is compiling.
    exports: { devExports: SOURCE_CONDITION },
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
        // Publishability is a build-time error rather than a release-time surprise: this fails a build whose
        // Manifest points at a file it does not ship.
        publint: { level: "error" },
      });
};
