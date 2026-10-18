import type { ExcelPushTipsCodexRow } from "#src/models/genshinAssets/archive/ExcelPushTipsCodexRow";
import type { ExcelPushTipsRow } from "#src/models/genshinAssets/archive/ExcelPushTipsRow";
import type { ExcelGlobalWatcherRow } from "#src/models/genshinAssets/tips/ExcelGlobalWatcherRow";

import { toTipRecords } from "#src/services/genshinAssets/tips/toTipRecords";
import { describe, expect, test } from "vitest";

describe(toTipRecords, () => {
  test("names a tutorial tip by its title and subtitle hashes", () => {
    expect.hasAssertions();

    const pushTipRows: ExcelPushTipsRow[] = [
      { pushTipsId: 1, pushTipsType: "PUSH_TIPS_TUTORIAL", subtitleTextMapHash: 22, titleTextMapHash: 11 },
    ];

    expect(toTipRecords(pushTipRows, [], [])).toStrictEqual([{ id: 1, subtitleTextId: "22", titleTextId: "11" }]);
  });

  test("carries the codex entry a tip is filed under, and none for a disused one", () => {
    expect.hasAssertions();

    const pushTipRows: ExcelPushTipsRow[] = [
      { pushTipsId: 1, pushTipsType: "PUSH_TIPS_TUTORIAL", subtitleTextMapHash: 22, titleTextMapHash: 11 },
      { pushTipsId: 2, pushTipsType: "PUSH_TIPS_TUTORIAL", subtitleTextMapHash: 33, titleTextMapHash: 44 },
    ];
    const codexRows: ExcelPushTipsCodexRow[] = [
      { id: 100, isDisuse: false, pushTipId: 1, sortOrder: 1 },
      { id: 200, isDisuse: true, pushTipId: 2, sortOrder: 2 },
    ];

    expect(toTipRecords(pushTipRows, codexRows, [])).toStrictEqual([
      { codexId: 100, id: 1, subtitleTextId: "22", titleTextId: "11" },
      { id: 2, subtitleTextId: "33", titleTextId: "44" },
    ]);
  });

  test("carries the trigger of a tip's watcher without the parameters left empty", () => {
    expect.hasAssertions();

    const pushTipRows: ExcelPushTipsRow[] = [
      {
        pushTipsId: 1,
        pushTipsType: "PUSH_TIPS_TUTORIAL",
        subtitleTextMapHash: 22,
        titleTextMapHash: 11,
        watcherId: 5001,
      },
    ];
    const watcherRows: ExcelGlobalWatcherRow[] = [
      { id: 5001, triggerConfig: { paramList: ["7001", "", ""], triggerType: "TRIGGER_FINISH_QUEST_OR" } },
    ];

    expect(toTipRecords(pushTipRows, [], watcherRows)).toStrictEqual([
      {
        id: 1,
        subtitleTextId: "22",
        titleTextId: "11",
        trigger: { paramList: ["7001"], triggerType: "TRIGGER_FINISH_QUEST_OR" },
      },
    ]);
  });

  test("leaves a watcher with no trigger kind out of a tip's trigger", () => {
    expect.hasAssertions();

    const pushTipRows: ExcelPushTipsRow[] = [
      {
        pushTipsId: 1,
        pushTipsType: "PUSH_TIPS_TUTORIAL",
        subtitleTextMapHash: 22,
        titleTextMapHash: 11,
        watcherId: 5001,
      },
    ];
    const watcherRows: ExcelGlobalWatcherRow[] = [{ id: 5001, triggerConfig: { paramList: ["7001"] } }];

    expect(toTipRecords(pushTipRows, [], watcherRows)).toStrictEqual([
      { id: 1, subtitleTextId: "22", titleTextId: "11" },
    ]);
  });

  test("leaves a push tip of another kind out, such as a monster's", () => {
    expect.hasAssertions();

    const pushTipRows: ExcelPushTipsRow[] = [
      { pushTipsId: 1, pushTipsType: "PUSH_TIPS_MONSTER", subtitleTextMapHash: 22, titleTextMapHash: 11 },
    ];

    expect(toTipRecords(pushTipRows, [], [])).toStrictEqual([]);
  });
});
