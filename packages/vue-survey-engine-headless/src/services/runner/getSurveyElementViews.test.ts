import { SurveyNodeType } from "#src/models/SurveyNodeType";
import { getSurveyElementViews } from "#src/services/runner/getSurveyElementViews";
import { surveyPlaceableNodeSchema } from "#src/services/surveyNodeSchema";
import { takeOne } from "@esposter/shared";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getSurveyElementViews, () => {
  const now = new Date(0);
  const listPointer = "/content/0/props/children";

  test("a hidden node is absent, and each view's pointer names its place in the document", () => {
    expect.hasAssertions();

    const nodes = [
      surveyPlaceableNodeSchema.parse({
        props: { id: "a", name: "a", visibleIf: "{x} = 'x'" },
        type: SurveyNodeType.Text,
      }),
      surveyPlaceableNodeSchema.parse({ props: { id: "b", name: "b" }, type: SurveyNodeType.Text }),
      surveyPlaceableNodeSchema.parse({
        props: { children: [{ props: { id: "c", name: "c" }, type: SurveyNodeType.Text }], id: v7() },
        type: SurveyNodeType.Panel,
      }),
    ];

    const views = getSurveyElementViews(nodes, listPointer, {}, now, true);

    expect(views.map(({ pointer }) => pointer)).toStrictEqual([
      "/content/0/props/children/1",
      "/content/0/props/children/2",
    ]);
    expect(takeOne(views, 1).children.map(({ pointer }) => pointer)).toStrictEqual([
      "/content/0/props/children/2/props/children/0",
    ]);
  });

  test("a panel with no shown element is absent", () => {
    expect.hasAssertions();

    const nodes = [
      surveyPlaceableNodeSchema.parse({
        props: {
          children: [{ props: { id: "a", name: "a", visibleIf: "{x} = 'x'" }, type: SurveyNodeType.Text }],
          id: v7(),
        },
        type: SurveyNodeType.Panel,
      }),
    ];

    expect(getSurveyElementViews(nodes, listPointer, {}, now, true)).toStrictEqual([]);
  });

  test("a node under a disabled panel is disabled, and a required question is marked", () => {
    expect.hasAssertions();

    const nodes = [
      surveyPlaceableNodeSchema.parse({
        props: {
          children: [{ props: { id: "a", isRequired: true, name: "a" }, type: SurveyNodeType.Text }],
          enableIf: "{x} = 'x'",
          id: v7(),
        },
        type: SurveyNodeType.Panel,
      }),
    ];

    const panel = takeOne(getSurveyElementViews(nodes, listPointer, {}, now, true), 0);
    const child = takeOne(panel.children, 0);

    expect(panel.isEnabled).toBe(false);
    expect(child.isEnabled).toBe(false);
    expect(child.isRequired).toBe(true);
  });

  test("a node is disabled when the parent it sits in is disabled, whatever its own condition", () => {
    expect.hasAssertions();

    const nodes = [surveyPlaceableNodeSchema.parse({ props: { id: "a", name: "a" }, type: SurveyNodeType.Text })];

    expect(takeOne(getSurveyElementViews(nodes, listPointer, {}, now, false), 0).isEnabled).toBe(false);
  });
});
