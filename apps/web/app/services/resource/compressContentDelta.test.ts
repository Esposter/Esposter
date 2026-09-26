import { compressContentDelta } from "@/services/resource/compressContentDelta";
import { instantiateZstdEncoder } from "@/services/resource/instantiateZstdEncoder";
import { getWindowLog } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { constants, zstdDecompressSync } from "node:zlib";
import { describe, expect, test } from "vitest";

describe(compressContentDelta, () => {
  // The committed build against the decoder the server runs, so a regeneration that drifts from node:zlib's frame
  // Format or dictionary semantics fails here rather than on a save
  test("writes a delta the server's decoder reads against the same baseline", async () => {
    expect.hasAssertions();

    const wasm = await readFile(new URL("../../generated/zstd/zstd.wasm", import.meta.url));
    const zstdEncoder = await instantiateZstdEncoder(wasm);
    const baseline = new TextEncoder().encode(" ".repeat(2 ** 16));
    const content = new TextEncoder().encode(`${" ".repeat(2 ** 16)}a`);
    const delta = compressContentDelta(zstdEncoder, content, baseline);
    const decodedContent = zstdDecompressSync(delta, {
      dictionary: baseline,
      params: { [constants.ZSTD_d_windowLogMax]: getWindowLog(baseline.byteLength, content.byteLength) },
    });

    expect(new Uint8Array(decodedContent)).toStrictEqual(content);
  });
});
