# Tasks

## 1. The primitives

- [x] 1.1 `mergeObjectsStrict` throws an `InvalidOperationError` naming a repeated key, and `MergeObjectsStrict` compares every pair of its sets. Verified by a mergeObjectsStrict test beside the merge for the scenarios 'Two sets sharing a key' and 'Sets with no key in common', the first seen failing against `Object.assign`, and by a type test beside `MergeObjectsStrict` for the scenario 'The first and last of three sets sharing a key', seen failing against the neighbour-only type.
- [ ] 1.2 `createEnumString` becomes createValueSetString, writing a constant object and its type, and the dungeons' Tiled and file-pack generators are re-run. Verified by its test beside it in `apps/web/scripts/util` for the scenario 'Generating a set from a listing'.

## 2. Every set on the one form

- [ ] 2.1 A throwaway codemod converts each package whole, one commit per package: every `enum` to its object and type, every member in a type position to `typeof` the member. Each package's typecheck and suite pass on the push; published packages with `isolatedDeclarations` build their declarations with no annotation added.
- [ ] 2.2 `erasableSyntaxOnly` turns on in `packages/configuration/tsconfig.base.json` in the commit converting the last package, so 'Declaring an enum' and 'A set loaded by Node's type stripping' are held by the typecheck. The member-naming selector in `packages/configuration/eslint/typescriptRules.js` moves to the object's keys, the literal-union rule's message names the form, the typescript skill's enum reference is rewritten and its `as const` exception list deleted, and the clicker spec's claim about the merge states what it now checks.
