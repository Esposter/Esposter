import { join } from "node:path";
import { describe } from "vitest";

// The wiki's own Advanced Properties templates, the oracle the wiki suites assert against
export const WIKI_FIXTURE_DIRECTORY: string = join(import.meta.dirname, "fixtures");

// Fixtures only: a suite here would run again in every file that imports them
describe.todo("constants");
