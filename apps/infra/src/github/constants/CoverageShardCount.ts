// Must match the length of the `coverage` job's `matrix.shard` in .github/workflows/CI.yaml — each shard
// Publishes its own `Coverage (n)` check context, and only contexts listed here are enforced.
const CoverageShardCount = 8;

export default CoverageShardCount;
