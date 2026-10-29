import { getGitBlobSha } from "#src/services/genshinText/getGitBlobSha";
import { describe, expect, test } from "vitest";

describe(getGitBlobSha, () => {
  test("names an empty file by git's empty blob", () => {
    expect.hasAssertions();

    expect(getGitBlobSha(new Uint8Array())).toBe("e69de29bb2d1d6434b8b29ae775ad8c2e48c5391");
  });

  test("names a file by the hash git gives its bytes", () => {
    expect.hasAssertions();

    expect(getGitBlobSha(new TextEncoder().encode("hello\n"))).toBe("ce013625030ba8dba906f756967f9e9ca394464a");
  });
});
