import { describe } from "vitest";

// Several suites here each read the whole tree, and Vitest runs them at once — so each one's wall time is its own
// Read plus every sibling read contending with it, which is several times what it measures alone. The default 5s
// Is what three of them were already sitting just under, and a fourth arriving is enough to fail all three. A
// Timeout is not the budget: what holds these honest is `pnpm bench`, and the shape of the contention is the
// `runtime-efficiency` skill's.
export const TREE_READ_TIMEOUT_MS: number = Temporal.Duration.from({ seconds: 60 }).total("milliseconds");

// Fixtures only: a suite here would run again in every file that imports them
describe.todo("constants");
