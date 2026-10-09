import { parseLsRemoteSha } from "#src/services/fleet/parseLsRemoteSha";
import { describe, expect, test } from "vitest";

const SHA = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";

describe(parseLsRemoteSha, () => {
  test("reads the sha of the ref a listing names", () => {
    expect.hasAssertions();

    expect(parseLsRemoteSha(`${SHA}\trefs/claims/city-areas\n`)).toBe(SHA);
  });

  test("reads an empty listing as no ref", () => {
    expect.hasAssertions();

    expect(parseLsRemoteSha("")).toBeUndefined();
  });
});
