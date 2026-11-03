import { SurveyMatrixCellType } from "#src/models/SurveyMatrixCellType";
import { surveyMatrixColumnSchema } from "#src/models/SurveyMatrixColumn";
import { surveyIdSchema } from "#src/services/surveyIdSchema";
import { surveyMatrixDynamicNodeType } from "#src/services/surveyMatrixDynamicNodeType";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe("surveyMatrixDynamicNodeType", () => {
  test("a dynamic matrix made from the default props parses once its id is added", () => {
    expect.hasAssertions();

    const nodeSchema = z.strictObject({ ...surveyMatrixDynamicNodeType.propsSchema.shape, id: surveyIdSchema });
    const result = nodeSchema.safeParse({
      ...surveyMatrixDynamicNodeType.createDefaultProps(),
      id: crypto.randomUUID(),
    });

    expect(result.success).toBe(true);
  });

  test("a dynamic matrix refuses a column list that repeats a column name", () => {
    expect.hasAssertions();

    const column = surveyMatrixColumnSchema.parse({ cellType: SurveyMatrixCellType.Text, name: "a" });
    const result = surveyMatrixDynamicNodeType.propsSchema.safeParse({
      ...surveyMatrixDynamicNodeType.createDefaultProps(),
      columns: [column, column],
    });

    expect(result.success).toBe(false);
  });
});
