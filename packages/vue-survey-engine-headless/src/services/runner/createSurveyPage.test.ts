import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { describe } from "vitest";

// A page holding the given elements, under a fresh id since a page's id is one the runner never reads
export const createSurveyPage = (children: unknown[], visibleIf = ""): unknown => ({
  props: { children, id: crypto.randomUUID(), visibleIf },
  type: SurveyNodeType.Page,
});

describe.todo("createSurveyPage");
