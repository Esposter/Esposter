import { describe } from "vitest";

// The one file name the fixture repository tests write, distinguished by extension or nesting where two must coexist
export const TEST_FILENAME = "a";

// Fixtures only: a suite here would run again in every file that imports them
describe.todo("constants");
