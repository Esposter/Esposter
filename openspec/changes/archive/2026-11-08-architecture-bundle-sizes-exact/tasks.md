# Tasks

## Bundle sizes (architecture/bundle-sizes)

- [x] Delete the checkout-dependent set, the tolerance and `settleBundleSizes` with its test, and read the build's sizes directly in `pnpm bundle-sizes:gen` and in `bundleSizes.test.ts`. Test first: `bundleSizes.test.ts` asserts 'the record is the size of every built file' against the unsettled sizes, seen failing for as long as a checkout-dependent file is still excused.
- [x] Regenerate `bundle-sizes.md` from a fresh build of every library package and both apps.
