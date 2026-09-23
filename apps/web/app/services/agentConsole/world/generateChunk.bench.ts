import { generateChunk } from "@/services/agentConsole/world/generateChunk";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";
// The chunk the room is stamped into, one out among the hills, and one further than anyone walks: a chunk's time does
// Not grow with how far out it is, so the world's cost is its view and never its size
describe(generateChunk, () => {
  test("one chunk", async ({ bench }) => {
    await bench.compare(
      bench("spawn", () => {
        generateChunk({ chunkX: 0, chunkZ: 0, isDoorOpen: false });
      }),
      bench("hills", () => {
        generateChunk({ chunkX: 3, chunkZ: 2, isDoorOpen: false });
      }),
      bench("far out", () => {
        generateChunk({ chunkX: 100_000, chunkZ: -100_000, isDoorOpen: false });
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
