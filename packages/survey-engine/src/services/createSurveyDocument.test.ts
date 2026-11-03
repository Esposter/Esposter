import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { checkSurveyDocument } from "#src/services/checkSurveyDocument";
import { createSurveyDocument } from "#src/services/createSurveyDocument";
import { surveyDocumentSchema } from "#src/services/surveyDocumentSchema";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(createSurveyDocument, () => {
  test("the empty survey is one page that parses with the document schema and holds no refusal", () => {
    expect.hasAssertions();

    const document = createSurveyDocument();

    expect(document.content.map(({ type }) => type)).toStrictEqual([SurveyNodeType.Page]);
    expect(surveyDocumentSchema.safeParse(document).success).toBe(true);
    expect(checkSurveyDocument(document)).toStrictEqual([]);
  });

  test("each empty survey takes a page id of its own", () => {
    expect.hasAssertions();

    const firstPageId = takeOne(createSurveyDocument().content, 0).props.id;
    const secondPageId = takeOne(createSurveyDocument().content, 0).props.id;

    expect(secondPageId).not.toBe(firstPageId);
  });
});
