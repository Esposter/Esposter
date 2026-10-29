import { sniffExtension } from "#src/services/genshinParity/reference/sniffExtension";
import { describe, expect, test } from "vitest";

describe(sniffExtension, () => {
  test("names a file by the signature its leading bytes carry, whatever its name", () => {
    expect.hasAssertions();
    expect(sniffExtension(Buffer.from("89504e47", "hex"))).toBe("png");
    // An MP4's type box starts four bytes in, after its size
    expect(sniffExtension(Buffer.from("00000000" + "66747970", "hex"))).toBe("mp4");
  });

  test("names a file no signature matches bin", () => {
    expect.hasAssertions();
    expect(sniffExtension(Buffer.from("00", "hex"))).toBe("bin");
  });
});
