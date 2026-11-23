import { TALK_REVEAL_MS_PER_CHARACTER } from "#src/services/dialogue/constants";
import { getTalkRevealedLength } from "#src/services/dialogue/getTalkRevealedLength";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// The reveal runs every frame of a talk, so it is measured at a dialogue line and at a long one. The whole line is
// Revealed, So each run walks it to the last character
describe(getTalkRevealedLength, () => {
  test.for([
    { line: "ab ".repeat(10), scale: "a short line" },
    { line: "ab ".repeat(1000), scale: "a long line" },
  ])("revealing $scale", async ({ line }, { bench }) => {
    const elapsedMs = line.length * TALK_REVEAL_MS_PER_CHARACTER;
    let revealed = 0;
    await bench("the whole line", () => {
      revealed += getTalkRevealedLength(line, elapsedMs);
    }).run(BENCHMARK_RUN_OPTIONS);
  });
});
