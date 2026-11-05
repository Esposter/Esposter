# The note image's column cap in the record

## Why

[Note images](../../specs/resource/note-images/design.md) caps an image at the column width through the rich-text typography: `apps/web/app/assets/css/globals.css` sets `img { max-width: 100%; height: auto; }`. The design's "How it works" names that cap as shipped.

The spec of record no longer says so. Commit `ace7069c0c` removed the requirement "An image renders no wider than the column" and its scenario, because a spec scenario is the name of a test and the cap has no test. Happy-dom lays out no box, so nothing can check the cap yet. The design's Notes say the same, and that is the only place the cap is recorded now.

A reader of the spec of record is therefore told nothing about shipped behaviour, and the spec and the design do not state the same thing about it.

## What Changes

Decide whether untested shipped behaviour belongs in the spec of record. The owner chooses between:

1. **Keep it out of the spec, and state it as a shipped, untested rule in the spec's purpose.** The spec keeps its scenario-as-test-name convention, and the design stays the record of the cap.
2. **Restore the requirement and its scenario, and make the test exist.** The cap needs a test that can fail, which needs the typography extracted into a package with a layout runner, or a check that pins the rule's text in CSS. The second is a test of the implementation, so the owner judges it before choosing it.

The chosen option is written as a spec delta for `note-images/spec.md`, which archive merges into the spec of record, and into `design.md` in place, in the change that ships it, so the two agree.

## Out of scope

- The column width itself, and the image rule's values.
