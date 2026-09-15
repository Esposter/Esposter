import { describe } from "vitest";

// The one file name the fixture repository tests write, distinguished by extension or nesting where two must coexist
export const TEST_FILENAME = "a";

// A fixture repository test is a dozen git processes, each a spawn on Windows
export const FIXTURE_TEST_TIMEOUT_MS: number = Temporal.Duration.from({ seconds: 60 }).total("milliseconds");

// Fixtures only: a suite here would run again in every file that imports them (`queueBranch.test.ts` holds the pin)
describe.todo("constants");
