// A bucket's copy checkpoints under `copy-objects/<bucket>`
export const COPY_OBJECTS_UNIT_PREFIX = "copy-objects";
// Azure stamps Last-Modified to the second, on its own clock, and this machine's clock can run behind it. The delta reaches
// back this far before the pre-copy began to cover both; a blob it copies again is skipped while its object is identical
export const DELTA_CLOCK_MARGIN_MS: number = Temporal.Duration.from({ minutes: 5 }).total("milliseconds");
