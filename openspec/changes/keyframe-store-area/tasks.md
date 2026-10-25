# Tasks

## 1. Area index

- [x] 1.1 Write openspec/specs/keyframe-store/README.md: what the package is, its key concepts (keyframe, delta, anchor, base, segment), and its two pages. Verify: `openspec validate keyframe-store-area --strict --no-interactive` passes, and the links in the index resolve.

## 2. Object format

- [x] 2.1 Write `object-format/{spec,design}.md` from the code: the address, the keyframe and delta forms, the promotion ratio and segment budget, the header, and the verified read. Verify: the scenario 'adopts content it already holds instead of writing it again' names an existing test in `packages/keyframe-store/src/createKeyframeStore.test.ts`, and so do 'round-trips a keyframe and the delta anchored to it to the exact input bytes', 'promotes a wholesale rewrite to a keyframe', 'promotes once the bytes anchored to a keyframe reach the segment budget' and 'refuses an object that does not decode to its key'.
- [x] 2.2 Add the test for a stranger's bytes, which no existing test names. Verify: a test named 'refuses bytes that do not open with the format's magic' is written first and seen failing against a parse that skips the magic check, then passes.

## 3. Version store

- [x] 3.1 Write `version-store/{spec,design}.md` from the code: the anchor, the base each write reports, the two-read reconstruction, the collection rule and the backend contract. Verify: the scenarios 'reports the twin's object when its write lands second', 'collects only what no surviving record names' and 'reports a collected version as absent rather than as corruption' name existing tests in the same suite.
- [x] 3.2 Add the tests for the scenarios no existing test names: 'a new keyframe reports no base', 'a delta is read with its keyframe', 'refuses an anchor that is a delta', and 'a write against a missing anchor starts a new lineage'. Verify: each test is written first, seen failing against the rule it pins, and then passes.

## 4. Package and pointers

- [ ] 4.1 Move the How it works section out of `packages/keyframe-store/README.md`, leaving the install page and a link to the area. Verify: `grep -n "How it works" packages/keyframe-store/README.md` returns nothing, and the duplicate-prose check in `scripts` passes.
- [x] 4.2 Repoint `openspec/specs/architecture/compression/design.md` and `openspec/specs/resource/resource-version-store/design.md` at the object format page instead of the README. Verify: `grep -rn "keyframe-store/README" openspec` returns nothing outside the package.

## 5. Archive

- [ ] 5.1 Archive the change into the specs with `pnpm exec openspec archive keyframe-store-area --yes`, and add its line to the architecture shipped log. Verify: openspec/specs/keyframe-store/object-format/spec.md and openspec/specs/keyframe-store/version-store/spec.md exist, and `openspec/changes/keyframe-store-area` is gone.
