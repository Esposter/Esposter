// The schema version every event this system publishes carries. One value across all publishers, so a consumer
// Reading `dataVersion` is reading a single repo-wide contract rather than one literal per call site; it only moves
// When a `data` payload shape changes incompatibly.
export const EVENT_GRID_DATA_VERSION = "1.0";
