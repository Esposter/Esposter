import { createHistory } from "#src/services/history/createHistory";
import { pushHistory } from "#src/services/history/pushHistory";
import { redoHistory } from "#src/services/history/redoHistory";
import { undoHistory } from "#src/services/history/undoHistory";
import { describe, expect, test } from "vitest";

describe(redoHistory, () => {
  test("redo order", () => {
    expect.hasAssertions();

    const history = pushHistory(pushHistory(createHistory<string>(2), "a"), "b");
    const firstUndo = undoHistory(history);
    const secondUndo = undoHistory(firstUndo.history);
    const firstRedo = redoHistory(secondUndo.history);
    const secondRedo = redoHistory(firstRedo.history);

    expect([firstRedo.entry, secondRedo.entry]).toStrictEqual(["a", "b"]);
    expect(secondRedo.history).toStrictEqual(history);
  });
});
