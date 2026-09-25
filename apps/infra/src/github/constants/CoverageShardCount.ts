// The length of the `coverage` job's `matrix.shard` in .github/workflows/CI.yaml — each shard publishes its own
// `Coverage (n)` check context, and only contexts listed here are enforced. `requiredChecks.test.ts` holds the two equal.
const CoverageShardCount = 8;

export default CoverageShardCount;
