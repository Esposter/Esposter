import { DataSourceTypes } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { sheetSettingsSchema } from "#shared/models/resource/sheet/SheetSettings";
import { describe, expect, test } from "vitest";

describe("sheetSettingsSchema", () => {
  test("has an arm for every data source type", () => {
    expect.hasAssertions();

    expect(new Set(sheetSettingsSchema.options.map((option) => option.shape.type.unwrap().value))).toStrictEqual(
      new Set(DataSourceTypes),
    );
  });
});
