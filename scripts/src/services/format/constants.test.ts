import { describe } from "vitest";

// A file under a `generated/` folder, which the formatter ignores, and one beside it, which it rewrites. Both hold the
// Same unformatted source, so the only difference between them is the path the formatter is given
export const GENERATED_PATH = "packages/example/src/generated/kit/Map.ts";
export const OUTSIDE_PATH = "packages/example/src/kit/Map.ts";
export const UNFORMATTED_SOURCE = "export const answer=42\n";
export const FORMATTED_SOURCE = "export const answer = 42;\n";

// Fixtures only: a suite here would run again in every file that imports them
describe.todo("constants");
