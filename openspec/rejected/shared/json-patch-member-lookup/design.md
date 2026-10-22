# JSON Patch Member Lookup

One primitive for the array-index-or-own-member test that the four JSON patch operations in `packages/shared/src/services/jsonPatch/` each write out.

**Why not:** The rule is already one function, `parseArrayIndex`, and the object test is `checkIsPlainObject` with `Object.hasOwn`. What repeats is the choice between them, and that choice is where the operations differ. A shared lookup would return only the member a segment names, and each caller would still narrow its container to index that member, so it would add a cast per caller without removing a branch. The callers then use the member differently: a read indexes it, an update rebuilds the array with `with` or the object with a spread, a removal splices the element or drops the key through a rest destructure, and an add appends past the end. The tests in `applyPatches.test.ts` drive each of those branches, so a change to the rule fails there.
