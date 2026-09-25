import { checkIsFileAccepted } from "@/services/file/checkIsFileAccepted";
import { describe, expect, test } from "vitest";

describe(checkIsFileAccepted, () => {
  test.each([
    { accept: undefined, isAccepted: true, name: "", type: "" },
    { accept: " ", isAccepted: true, name: "", type: "" },
    { accept: ".a", isAccepted: true, name: "b.A", type: "" },
    { accept: ".a", isAccepted: false, name: "b.c", type: "" },
    { accept: "a/*", isAccepted: true, name: "", type: "a/b" },
    { accept: "a/*", isAccepted: false, name: "", type: "b/a" },
    { accept: "a/b", isAccepted: true, name: "", type: "a/b" },
    { accept: "a/b", isAccepted: false, name: "", type: "a/c" },
    // Every token is trimmed and lowercased, so a list written with spaces after its commas reads the same
    { accept: "a/b, .C", isAccepted: true, name: "d.c", type: "" },
  ])("$accept accepts $name $type: $isAccepted", ({ accept, isAccepted, name, type }) => {
    expect.hasAssertions();

    expect(checkIsFileAccepted({ name, type }, accept)).toBe(isAccepted);
  });
});
