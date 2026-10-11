import { NONCE_BYTE_LENGTH } from "#src/runtime/constants";
import { generateNonce } from "#src/runtime/services/generateNonce";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A CSP nonce: the platform's random bytes encoded for the header. The native baseline is the bytes alone.
describe(generateNonce, () => {
  test("a nonce", async ({ bench }) => {
    await bench.compare(
      bench("native — random bytes alone", () => globalThis.crypto.getRandomValues(new Uint8Array(NONCE_BYTE_LENGTH))),
      bench("a CSP nonce", () => generateNonce()),
      { ...BENCHMARK_RUN_OPTIONS, iterations: 2000, warmupIterations: 200 },
    );
  });
});
