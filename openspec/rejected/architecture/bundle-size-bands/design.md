# Bundle size bands

Each package's size test used to pin its built bundle and its types to a band: the smallest power of two in kibibytes that sat a tenth above the file, recorded as a line such as `up to 64 KB` and compared by equality. That is rejected. It was replaced by a ceiling per file, which is itself [rejected](../bundle-size-ceilings/design.md) for the record of exact sizes.

## Why not

**Healthy growth moved the band.** A band's upper edge sits a tenth under its power of two, so a few hundred bytes of growth near that edge changed the recorded line and failed a suite that had done nothing wrong. An ordinary addition of code could tip it as easily as a dependency nobody meant to ship.

**A shrink failed it too.** The comparison was by equality, so removing code failed the suite as surely as adding it, and a deletion became an edit to a recorded line to make the suite green again. A shrink below the band's floor was the same failure.

**The edge could not be predicted.** Where an edge fell depended on the exact size of the file, so no author could tell whether the next change would cross it. The failure arrived on whichever unrelated change happened to tip the file over.

**The recorded number was a rounding, not a limit.** The test stored a band rather than a number anyone had chosen, so what it asserted was a quantisation of a measurement. Nobody could say how large a bundle was allowed to be, only which band it happened to sit in.

## What stands instead

The [bundle sizes](../../../specs/architecture/bundle-sizes/design.md) record of every built file's exact bytes, held to a fresh build by one workspace test. Nothing is rounded, and a shrink and a growth both show in the diff.

## The revisit trigger

The record churns on every unrelated change so that its diff is noise, which no build so far has made it. Then it gives way to a measured budget read in review. The [bundle budgets](../../../deferred/architecture/bundle-budgets/design.md) page argues against one global number answered by raising it, and wants a per-route first-load number defined before any budget is enforced.
