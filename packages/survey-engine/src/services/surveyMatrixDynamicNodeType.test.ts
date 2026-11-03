import { SurveyMatrixCellType } from "#src/models/SurveyMatrixCellType";
import { surveyMatrixColumnSchema } from "#src/models/SurveyMatrixColumn";
import { surveyMatrixDynamicNodeType } from "#src/services/surveyMatrixDynamicNodeType";
import { describe, expect, test } from "vitest";

describe("surveyMatrixDynamicNodeType", () => {
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
