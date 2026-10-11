import type { DeepOptionalUndefined } from "#src/util/types/DeepOptionalUndefined";
import type { TypeBenchFixture } from "#src/util/types/TypeBench.fixture";
import type { PartialOnUndefinedDeep } from "type-fest";

// Read down to the deepest link, for the same reason as DeepOmit: a mapped type's members are resolved on a read
export type DeepOptionalUndefinedFixture =
  DeepOptionalUndefined<TypeBenchFixture>["members"][number]["profile"]["links"][number];
export type PartialOnUndefinedDeepFixture =
  PartialOnUndefinedDeep<TypeBenchFixture>["members"][number]["profile"]["links"][number];
