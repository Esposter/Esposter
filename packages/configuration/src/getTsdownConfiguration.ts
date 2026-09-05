import type { TsdownConfigurationOptions } from "#src/models/TsdownConfigurationOptions";
import type { UserConfig } from "tsdown";

import { BUILD_TSCONFIG, SOURCE_CONDITION } from "#src/constants";
import { generateExports } from "#src/generateExports";
import { getPackagePatterns } from "#src/getPackagePatterns";
import { readPackageManifest } from "#src/readPackageManifest";
import { mergeConfig } from "tsdown";

// The base every package's `tsdown.config.ts` calls. tsdown already defaults `outDir` to `dist`, `format` to
// `esm` and `clean` to true, so none of those are restated here — `entry` is, for the reason given on it.
//
// Compose these factories with `mergeConfig`, never by spreading one into an object literal. A spread replaces
// A key outright, so a config that adds one `deps` or `dts` field silently drops every other field the base
// Set on it — `mergeConfig` merges into them instead.
//
// Whether a package is published is the only thing that changes the shape of a build, so it is asked once. A
// Published package owes an installable promise to a stranger, and `publint` and `attw` are the gates that
// Hold it to that promise. A private package owes nobody anything and gets neither.
//
// `exportsGeneration` says which barrel the build generates for itself, and the three answers it can give are
// The whole of what a package may vary here.
export const getTsdownConfiguration = ({ exportsGeneration }: TsdownConfigurationOptions = {}): UserConfig => {
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
    // The same path tsdown would have defaulted to, and stating it is what makes the hook below usable. Left
    // Unset, tsdown treats the default as a glob and resolves it while it is still resolving the config —
    // Before any hook runs — so a package whose barrel is not on disk yet dies with "No input files" rather
    // Than generating one. A literal entry is handed to rolldown instead, which reads it after `build:prepare`.
    entry: "src/index.ts",
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
    // Every package here is `"type": "module"`, so a `.js` file is already unambiguously ESM. The `.mjs`
    // Extension that tsdown defaults to on the node platform buys nothing — it only makes the output path
    // Differ between the node packages and the neutral ones.
    fixedExtension: false,
    // Barrel generation belongs to the build rather than to a line in front of it — one definition here
    // Instead of the same command repeated in every manifest, and the one place a guard can live.
    hooks: {
      "build:prepare": () => {
        generateExports(exportsGeneration);
      },
    },
    platform: "neutral",
    tsconfig: BUILD_TSCONFIG,
  } satisfies UserConfig;
  return isPrivate
    ? // No declarations. A private package's `dist` is only ever reached through the `default` arm, by something
      // That runs it rather than types against it — a host loading a deploy artifact, Node loading the
      // Infrastructure program. Everything that types against one resolves `SOURCE_CONDITION` and reads the
      // Package's TypeScript, so an emitted `.d.ts` has no reader at all — and the emit is not free: a package
      // Whose types cannot satisfy `isolatedDeclarations` falls back to a full TypeScript program, which for
      // The Drizzle schema would be minutes of build time and a multi-megabyte file nothing opens. Deriving
      // From `private` rather than opting in per package also means it cannot be forgotten. What it leaves
      // Behind is one full program rather than none: every published package extends `tsconfig.library.json`
      // And emits per file under `isolatedDeclarations`, except `vue-phaserjs`, whose `.vue` declarations
      // Belong to vue-tsc and have no per-file path to take at all — see `getTsdownConfigurationVue`, which
      // Loads the whole program on purpose. The slow path is exactly the one package that cannot avoid it,
      // And a new published package taking it would have to have left the library preset to do so.
      mergeConfig(commonConfiguration, { dts: false })
    : mergeConfig(commonConfiguration, {
        // Declarations are consumed through whatever resolution mode the consumer picked, so they are checked
        // Against all of them. `esm-only` rather than `node16`: every package here is `"type": "module"` with
        // No CJS output, and the stricter profiles fail on a dual-format contract we do not offer.
        attw: { level: "error", profile: "esm-only" },
        dts: { tsconfig: BUILD_TSCONFIG },
        // Publishability is a build-time error rather than a release-time surprise: this fails a build whose
        // Manifest points at a file it does not ship.
        publint: { level: "error" },
      });
};
