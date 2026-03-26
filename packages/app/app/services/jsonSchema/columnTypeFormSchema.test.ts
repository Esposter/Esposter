import { columnTypeFormSchema } from "#shared/models/tableEditor/file/column/ColumnTypeForm";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { describe, expect, test } from "vitest";

describe("columnTypeFormSchema", () => {
  test("produces correct json schema for vjsf", () => {
    expect.hasAssertions();

    expect(zodToJsonSchema(columnTypeFormSchema)).toMatchInlineSnapshot();
  });
});
