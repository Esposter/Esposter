import { JSONClassMap } from "#shared/services/superjson/JSONClassMap";
import { describe, expect, test } from "vitest";

describe("jsonClassMap", () => {
  // A key is the name a serialized payload revives its class by, and the map's shorthand entries take it from the
  // Class's own name — so renaming a registered class would silently rename its key and strand what was written
  // Under the old one. The list is the on-disk format, written out so that change has to be made on purpose
  test("registers every class under its frozen key", () => {
    expect.hasAssertions();

    expect(Object.keys(JSONClassMap)).toStrictEqual([
      "BasicChartConfiguration",
      "BooleanColumn",
      "Chart",
      "Clicker",
      "ClickerSave",
      "ComputedColumn",
      "Dashboard",
      "DateColumn",
      "Dungeons",
      "EmailEditor",
      "FlowchartEditor",
      "MessageEmojiMetadataEntity",
      "NumberColumn",
      "Row",
      "StandardMessageEntity",
      "StringColumn",
      "SurveyResponseEntity",
      "TodoListItem",
      "Visual",
      "WebhookMessageEntity",
      "WebpageEditor",
    ]);
  });
});
