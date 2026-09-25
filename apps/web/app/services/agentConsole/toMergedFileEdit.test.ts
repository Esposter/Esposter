import { toMergedFileEdit } from "@/services/agentConsole/toMergedFileEdit";
import { describe, expect, test } from "vitest";

describe(toMergedFileEdit, () => {
  const filePath = "filePath";
  const id = "id";

  test("replays every edit over where the file started", () => {
    expect.hasAssertions();

    expect(
      toMergedFileEdit(filePath, "a\r\na", [
        { filePath, id, isReplaceAll: true, newText: "b", oldText: "a" },
        { filePath, id, isReplaceAll: false, newText: "$&", oldText: "b" },
      ]),
    ).toStrictEqual({ filePath, id: filePath, isReplaceAll: false, newText: "$&\nb", oldText: "a\na" });
  });

  test("takes a whole file written as where it is now", () => {
    expect.hasAssertions();

    expect(
      toMergedFileEdit(filePath, "a", [{ filePath, id, isReplaceAll: false, newText: "b", oldText: "" }]),
    ).toStrictEqual({ filePath, id: filePath, isReplaceAll: false, newText: "b", oldText: "a" });
  });

  test("merges nothing when an edit's replaced text is not in the file", () => {
    expect.hasAssertions();

    expect(
      toMergedFileEdit(filePath, "", [{ filePath, id, isReplaceAll: false, newText: "", oldText: "a" }]),
    ).toBeUndefined();
  });
});
