import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { v7 } from "uuid";
import { describe } from "vitest";

// A page holding the given elements, under a fresh id since a page's id is one the runner never reads
export const createSurveyPage = (children: unknown[], visibleIf = "", enableIf = ""): unknown => ({
  props: { children, enableIf, id: v7(), visibleIf },
  type: SurveyNodeType.Page,
});

describe.todo("createSurveyPage");
