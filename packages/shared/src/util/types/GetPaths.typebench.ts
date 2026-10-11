import type { GetPaths } from "#src/util/types/GetPaths";
import type { GetProperties } from "#src/util/types/GetProperties";
import type { TypeBenchFixture } from "#src/util/types/TypeBench.fixture";
import type { Get, Paths } from "type-fest";

// Ours against type-fest's own path walk over the same fixture: GetPaths reads its paths from GetProperties
export type GetPropertiesFixture = GetProperties<TypeBenchFixture>;
export type GetPathsFixture = GetPaths<TypeBenchFixture>;
export type TypeFestPathsFixture = Paths<TypeBenchFixture>;
export type TypeFestGetFixture = Get<TypeBenchFixture, Paths<TypeBenchFixture>>;
