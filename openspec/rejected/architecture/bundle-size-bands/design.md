# Bundle size bands

Each package's size test used to pin its built bundle and its types to a band: the smallest power of two in kibibytes that sat a tenth above the file, recorded as a line such as `up to 64 KB` and compared by equality. That is rejected. Each size test now holds its file to a ceiling written in the test, in KiB, and any size at or under it passes.

## Why not

**Healthy growth moved the band.** A band's upper edge sits a tenth under its power of two, so a few hundred bytes of growth near that edge changed the recorded line and failed a suite that had done nothing wrong. An ordinary addition of code could tip it as easily as a dependency nobody meant to ship.

**A shrink failed it too.** The comparison was by equality, so removing code failed the suite as surely as adding it, and a deletion became an edit to a recorded line to make the suite green again. A shrink below the band's floor was the same failure.

**The edge could not be predicted.** Where an edge fell depended on the exact size of the file, so no author could tell whether the next change would cross it. The failure arrived on whichever unrelated change happened to tip the file over.

**The recorded number was a rounding, not a limit.** The test stored a band rather than a number anyone had chosen, so what it asserted was a quantisation of a measurement. Nobody could say how large a bundle was allowed to be, only which band it happened to sit in.

## What stands instead

An explicit ceiling per bundle and per types file, written in the package's own test. Growth below it never fails, nothing is rounded and a shrink never fails. A change that legitimately outgrows a ceiling raises that one number in the same commit, after a fresh build shows the real size; the procedure is the `build` skill's (`.agents/skills/build/references/dist-size.md`).

## The revisit trigger

The same package's `src/index.test.ts` has three commits that each raise a ceiling and add neither a dependency nor an export, which `git log -p` on that file shows. Then the number records the growth instead of a limit someone chose, and the ceilings give way to a measured budget read in review. The [bundle budgets](../../../deferred/architecture/bundle-budgets/design.md) page argues against one global number answered by raising it, and wants a per-route first-load number defined before any budget is enforced.
