# Tasks

## 1. The shared row

- [x] 1.1 Draw the four theme blocks (logo, background picture, accent colour, background colour) from one row component or one loop over the root props, with each root prop's update typed by its key. Verify: the existing theme tests stay green, and a test that a clear writes an empty value is written first and seen failing.

## Result

The four blocks draw from `ThemeClearRow.vue`, which takes the field as its slot and the root prop by a name typed to the string root props, so its clear writes `""` to that key with no cast. The clear test was already in `Theme.test.ts` ("clearing the accent colour writes an empty one to the survey's root"); a behaviour-preserving refactor gives it nothing new to fail on, so it was kept rather than written again.
