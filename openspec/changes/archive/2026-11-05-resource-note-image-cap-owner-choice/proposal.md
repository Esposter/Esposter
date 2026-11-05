# The note image's column cap: the owner's choice

## Why

The archived change `2026-11-05-resource-note-image-cap-record` asks the owner to choose between two ways of recording the note image's column cap, and task 1.1 is checked on the strength of `note-images/design.md`, "Notes". That paragraph states the choice (the cap is kept in the Purpose, the test-pinning alternative lost), but no owner decision stands behind it: the session made the choice itself. The Purpose edit in `openspec/specs/resource/note-images/spec.md` therefore rests on a choice the archived proposal reserves for the owner.

## What Changes

The owner chooses between the two options in the archived proposal:

1. **Keep the cap out of the spec, and state it as a shipped, untested rule in the spec's Purpose.** The design stays the record of the cap.
2. **Restore the requirement and its scenario, and make the test exist.** This needs a layout test, which needs the typography extracted into a package with a layout runner, or a check that pins the rule's text in CSS. The owner judges that test before choosing it.

Then the chosen option is applied as the archived proposal describes: a requirements delta under option 2, or under option 1 the owner's route for the Purpose sentence (a direct edit named as an exception, or the design alone). Until the owner chooses, the Notes paragraph in `note-images/design.md` stands as the session's provisional choice, not a decision.

## Decision

The owner chose option 1. The cap stays out of the requirements and is stated as a shipped, untested rule in the Purpose of `openspec/specs/resource/note-images/spec.md`, and the design stays the record of it. The Purpose sentence is the direct edit already made, named here as the exception to the delta route, so no requirements delta is written. The reason is the one the design gives: happy-dom lays out no box, and a layout test needs the typography, with the interface tokens it reads, moved into a package with a browser suite, which none of the packages that have one owns. A check that pins the rule's text in CSS tests the implementation and cannot fail honestly.

## Out of scope

- The column width itself, and the image rule's values.
