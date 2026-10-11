import type { DeepOmit } from "#src/util/types/DeepOmit";
import type { TypeBenchFixture } from "#src/util/types/TypeBench.fixture";

// Read down to the deepest link: a mapped type resolves its members lazily, so an alias that is never read counts
// Only its head, and the read forces every level of the fixture the way a caller reading a field does
export type DeepOmitFixture = DeepOmit<TypeBenchFixture, "id">["members"][number]["profile"]["links"][number];
