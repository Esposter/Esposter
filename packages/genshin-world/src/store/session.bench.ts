import { startTestWorldSession } from "#src/store/session.fixture";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";
import { shallowRef } from "vue";

const READ_COUNT = 1000;
const NAME_TEXT: Readonly<Record<string, string>> = { "1": "Made-up Name" };
const worldSessionStore = startTestWorldSession({ nameText: NAME_TEXT });
// What a read is counted by: the length of the one string every read finds
let reads = 0;

// A session's frame reads the context a few times a frame, so the figure is the cost of one thousand reads of the same
// Value held three ways: a ref, a store's getter, which sits on a computed, and a field of a store's ref, which sits behind
// The store's reactive proxy. A plain constant is left out, since the compiler lifts a read of one out of the loop
describe("a read of the session's context", () => {
  test("read one thousand times", async ({ bench }) => {
    const nameTextRef = shallowRef(NAME_TEXT);
    await bench.compare(
      bench("a ref", () => {
        for (let index = 0; index < READ_COUNT; index++) reads += nameTextRef.value["1"]?.length ?? 0;
      }),
      bench("a store's getter", () => {
        for (let index = 0; index < READ_COUNT; index++) reads += worldSessionStore.nameText["1"]?.length ?? 0;
      }),
      bench("a field of a store's ref", () => {
        for (let index = 0; index < READ_COUNT; index++) reads += worldSessionStore.inventory.items.length;
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
