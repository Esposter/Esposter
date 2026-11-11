# Bundle size ceilings

Each library package and the two apps held their built bundle and its declarations to a ceiling in KiB written in an `index.test.ts`, and any size at or under it passed. That is rejected. The [bundle sizes](../../../specs/architecture/bundle-sizes/design.md) record holds every built file's exact bytes in one committed file.

## Why not

**A ceiling saw growth and nothing else.** A bundle could collapse, as when ambient declarations stop reaching the declaration build, and every test stayed green. The record shows a shrink as plainly as a growth.

**The number said nothing about the size.** A ceiling is a limit someone chose, and how big a bundle really was lived only in a build's output. Reading it meant building and measuring by hand, and the real size never appeared in a diff.

**It was one test file per package.** Dozens of files held numbers that rose by habit, each raised whenever its package outgrew it, which is the failure the [bands page](../bundle-size-bands/design.md) named as its revisit trigger.

## What stands instead

One committed record of every built file's exact size and one workspace test holding it to a fresh build. The builds are byte-identical from any checkout, so no per-platform record is needed. An equality snapshot per package had to be split by platform before, and a record that comes from the build instead of the test does not.

## The revisit trigger

A file turns out to differ between two machines. Then the record is written per platform, as the bench reports of a host-dependent workload are.
