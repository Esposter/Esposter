# Build

Each package's tsdown configuration, tsconfig and manifest placement — externals, `sideEffects`, `onlyImport`, and what a manifest lists.

Greps over the scope, `packages`:

1. `declare module ["'][^"'./#:*$]` over `packages`, with `*.test.ts` and `*.md` excluded. A published package's declaration that augments a bare module makes a consumer resolve that module, so the package lists it in `dependencies` or `peerDependencies`. A hit whose package lists the name only under `devDependencies` is the fix's manifest. A name in no manifest is an ambient declaration of its own, such as `claude-code`, and a `virtual:` name is a virtual module, not a package; neither is a hit.
