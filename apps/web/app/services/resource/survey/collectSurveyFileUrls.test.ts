import { collectSurveyFileUrls } from "@/services/resource/survey/collectSurveyFileUrls";
import { surveyDocumentSchema, SurveyNodeType } from "headless-survey-engine";
import { describe, expect, test } from "vitest";

// Each node takes a fresh id, which the document schema requires to be unique
const createImage = (imageLink: string) => ({
  props: { id: crypto.randomUUID(), imageLink, name: "image" },
  type: SurveyNodeType.Image,
});
const createPicker = (imageLinks: string[]) => ({
  props: {
    choices: imageLinks.map((imageLink) => ({ imageLink, text: "", value: imageLink })),
    id: crypto.randomUUID(),
    name: "picker",
  },
  type: SurveyNodeType.ImagePicker,
});
const createPage = (children: unknown[]) => ({
  props: { children, id: crypto.randomUUID() },
  type: SurveyNodeType.Page,
});

describe(collectSurveyFileUrls, () => {
  test("a survey's files are its logo and its pictures, sorted, each once and without the empty ones", () => {
    expect.hasAssertions();

    const document = surveyDocumentSchema.parse({
      content: [createPage([createImage("b"), createImage(""), createPicker(["a", "b"])])],
      root: { props: { logo: "c" } },
    });

    expect(collectSurveyFileUrls(document)).toStrictEqual(["a", "b", "c"]);
  });

  test("a picture inside a panel or a dynamic panel's template is a file of the survey", () => {
    expect.hasAssertions();

    const panel = { props: { children: [createImage("d")], id: crypto.randomUUID() }, type: SurveyNodeType.Panel };
    const dynamicPanel = {
      props: { id: crypto.randomUUID(), name: "dynamic", template: [createImage("e")] },
      type: SurveyNodeType.PanelDynamic,
    };
    const document = surveyDocumentSchema.parse({ content: [createPage([panel, dynamicPanel])], root: { props: {} } });

    expect(collectSurveyFileUrls(document)).toStrictEqual(["d", "e"]);
  });
});
