import { getSourceParameters } from "#src/services/getSourceParameters";
import { assert, describe, expect, test } from "vitest";

describe(getSourceParameters, () => {
  const BYTES = new Uint8Array([1]);

  test("bytes are copied, so the renderer's transfer leaves the caller's buffer in place", async () => {
    expect.hasAssertions();

    const parameters = await getSourceParameters(BYTES);

    assert("data" in parameters);
    expect(parameters.data.buffer).not.toBe(BYTES.buffer);
  });
});
