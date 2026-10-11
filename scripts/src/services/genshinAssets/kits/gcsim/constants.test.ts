import { join } from "node:path";
import { describe } from "vitest";

// The text of gcsim at v2.47.2 (MIT, its licence beside it), the oracle the readers' suites assert against
export const GCSIM_FIXTURE_DIRECTORY: string = join(import.meta.dirname, "fixtures", "xiangling");

// Fixtures only: a suite here would run again in every file that imports them
describe.todo("constants");
