import { takeOne } from "@esposter/shared";
import { describe } from "vitest";

import type { ReviewFinding } from "./models/ReviewFinding";
import type { RunResult } from "./models/RunResult";

/** The nth reported finding of a run. Every caller asserts on a report it just proved has that row. */
export const getFinding = (run: RunResult, index = 0): ReviewFinding => takeOne(run.result.findings ?? [], index);

describe.todo("getFinding");
