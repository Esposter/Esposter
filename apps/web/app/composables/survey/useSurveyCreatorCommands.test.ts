// @vitest-environment nuxt
import type {
  SurveyDocument,
  SurveyPageNode,
  SurveyPanelDynamicNode,
  SurveyPlaceableNode,
  SurveyTemplateNode,
  SurveyTextNode,
} from "headless-survey-engine";

import { useSurveyCreatorCommands } from "@/composables/survey/useSurveyCreatorCommands";
import { useSurveyCreatorStore } from "@/store/survey/creator";
import {
  createSurveyDocument,
  surveyDocumentSchema,
  SurveyNodeType,
  surveyNodeTypeDefinitionMap,
} from "headless-survey-engine";
import { createPinia, setActivePinia } from "pinia";
import { describe, expect, test } from "vitest";

const createQuestion = (name: string): SurveyTextNode => ({
  props: { ...surveyNodeTypeDefinitionMap[SurveyNodeType.Text].createDefaultProps(), id: crypto.randomUUID(), name },
  type: SurveyNodeType.Text,
});
const createDynamicPanel = (name: string, template: SurveyTemplateNode[]): SurveyPanelDynamicNode => ({
  props: {
    ...surveyNodeTypeDefinitionMap[SurveyNodeType.PanelDynamic].createDefaultProps(),
    id: crypto.randomUUID(),
    name,
    template,
  },
  type: SurveyNodeType.PanelDynamic,
});
const createPage = (children: SurveyPlaceableNode[]): SurveyPageNode => ({
  props: {
    ...surveyNodeTypeDefinitionMap[SurveyNodeType.Page].createDefaultProps(),
    children,
    id: crypto.randomUUID(),
  },
  type: SurveyNodeType.Page,
});
const createDocument = (content: SurveyPageNode[]): SurveyDocument => ({ ...createSurveyDocument(), content });
// A page with its children replaced, so an expected page keeps the ids of the nodes it holds
const withChildren = (page: SurveyPageNode, children: SurveyPlaceableNode[]): SurveyPageNode => ({
  ...page,
  props: { ...page.props, children },
});
// Loads a survey of the pages given, then hands back the commands with the store's refs the assertions read
const setup = (content: SurveyPageNode[]) => {
  setActivePinia(createPinia());
  const surveyCreatorStore = useSurveyCreatorStore();
  const { document, isRedoable, isUndoable, selectedPointer } = storeToRefs(surveyCreatorStore);
  const { load } = surveyCreatorStore;
  const original = createDocument(content);
  load(original);
  return { document, isRedoable, isUndoable, original, selectedPointer, ...useSurveyCreatorCommands() };
};

describe(useSurveyCreatorCommands, () => {
  test("inserts a rating question after the selected question and selects it", () => {
    expect.hasAssertions();

    const { document, insertNode, select, selectedPointer } = setup([
      createPage([createQuestion("question1"), createQuestion("question2")]),
    ]);
    select("/content/0/props/children/0");
    insertNode(SurveyNodeType.Rating);

    expect(document.value.content[0]?.props.children.map(({ type }) => type)).toStrictEqual([
      SurveyNodeType.Text,
      SurveyNodeType.Rating,
      SurveyNodeType.Text,
    ]);
    expect(selectedPointer.value).toBe("/content/0/props/children/1");
  });

  test("inserts a kind at an index of a slot as one undoable edit, and selects it", () => {
    expect.hasAssertions();

    const { document, insertNodeAt, original, selectedPointer, undo } = setup([
      createPage([createQuestion("question1"), createQuestion("question2")]),
    ]);
    insertNodeAt(SurveyNodeType.Rating, "/content/0/props/children", 1);

    expect(document.value.content[0]?.props.children.map(({ type }) => type)).toStrictEqual([
      SurveyNodeType.Text,
      SurveyNodeType.Rating,
      SurveyNodeType.Text,
    ]);
    expect(selectedPointer.value).toBe("/content/0/props/children/1");

    undo();

    expect(document.value).toStrictEqual(original);
  });

  test("names a duplicate from the stem of its question's name, as an inserted question is named", () => {
    expect.hasAssertions();

    const { document, duplicateNode } = setup([createPage([createQuestion("question1")])]);
    duplicateNode("/content/0/props/children/0");

    expect(
      document.value.content[0]?.props.children.map(({ props }) => ("name" in props ? props.name : undefined)),
    ).toStrictEqual(["question1", "question2"]);
  });

  test("moves a question up past its previous sibling, and the document passes the survey check", () => {
    expect.hasAssertions();

    const first = createQuestion("question1");
    const second = createQuestion("question2");
    const page = createPage([first, second]);
    const { document, moveNodeUp } = setup([page]);
    moveNodeUp("/content/0/props/children/1");

    expect(document.value).toStrictEqual(createDocument([withChildren(page, [second, first])]));
    expect(surveyDocumentSchema.safeParse(document.value).success).toBe(true);
  });

  test("refuses moving a dynamic panel into the template of another dynamic panel, and changes nothing", () => {
    expect.hasAssertions();

    const panel = createDynamicPanel("question1", [createQuestion("question2")]);
    const otherPanel = createDynamicPanel("question3", []);
    const { document, isUndoable, moveNodeTo, original } = setup([createPage([panel, otherPanel])]);
    const isMoved = moveNodeTo("/content/0/props/children/1", "/content/0/props/children/0/props/template", 0);

    expect(isMoved).toBe(false);
    expect(document.value).toStrictEqual(original);
    expect(isUndoable.value).toBe(false);
  });

  test("undoes a move to another page, putting the question back where it was", () => {
    expect.hasAssertions();

    const first = createQuestion("question1");
    const second = createQuestion("question2");
    const third = createQuestion("question3");
    const firstPage = createPage([first, second]);
    const secondPage = createPage([third]);
    const { document, isRedoable, isUndoable, moveNodeTo, original, undo } = setup([firstPage, secondPage]);
    moveNodeTo("/content/0/props/children/1", "/content/1/props/children", 1);

    expect(document.value).toStrictEqual(
      createDocument([withChildren(firstPage, [first]), withChildren(secondPage, [third, second])]),
    );

    undo();

    expect(document.value).toStrictEqual(original);
    expect(isRedoable.value).toBe(true);
    expect(isUndoable.value).toBe(false);
  });

  test("redoes an undone move, putting the question on the other page again", () => {
    expect.hasAssertions();

    const first = createQuestion("question1");
    const second = createQuestion("question2");
    const third = createQuestion("question3");
    const firstPage = createPage([first, second]);
    const secondPage = createPage([third]);
    const { document, isRedoable, moveNodeTo, redo, undo } = setup([firstPage, secondPage]);
    moveNodeTo("/content/0/props/children/1", "/content/1/props/children", 1);
    undo();
    redo();

    expect(document.value).toStrictEqual(
      createDocument([withChildren(firstPage, [first]), withChildren(secondPage, [third, second])]),
    );
    expect(isRedoable.value).toBe(false);
  });

  test("typing into one property of a question is a single undo step", () => {
    expect.hasAssertions();

    const first = createQuestion("question1");
    const page = createPage([first]);
    const { document, isUndoable, original, undo, updateNodeProps } = setup([page]);
    updateNodeProps("/content/0/props/children/0", { title: "W" });
    updateNodeProps("/content/0/props/children/0", { title: "Wh" });
    updateNodeProps("/content/0/props/children/0", { title: "Why" });
    undo();

    expect(document.value).toStrictEqual(original);
    expect(isUndoable.value).toBe(false);
  });
});
