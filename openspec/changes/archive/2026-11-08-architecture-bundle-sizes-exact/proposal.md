# Bundle sizes are exact in every folder

## Why

The two Vue component packages' script and style bundles used to differ by a few bytes between checkout folders, because the SFC compiler hashed the file's absolute path into each `v-bind` variable name in a style block. The record kept those four files at their recorded size inside a tolerance so a build from another folder neither failed the check nor rewrote the record. The compiler now seeds those names with the component's scope id instead of the path (ubugeeei-prod/vize#12056, fixed in 0.706.0), and the catalog resolves a release past it, so the four files are as exact as every other and the allowance has nothing left to allow.

## What Changes

- The record is compared with the sizes a build produced, with no file excused from an exact match.
- The list of checkout-dependent files, the tolerance and the step that settled them against the record are deleted.

## Capabilities

- **architecture/bundle-sizes** (changed)

## Waiting on

None.

## Impact

- `scripts/src/services/bundleSizes/` — the constants lose the checkout-dependent set and the tolerance, and `settleBundleSizes.ts` and its test go.
- `scripts/src/bundleSizes/index.ts` and `scripts/src/workspace/bundleSizes.test.ts` — both read the build's sizes directly.
- `bundle-sizes.md` — regenerated from a fresh build.
