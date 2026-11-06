// @vitest-environment nuxt
import EditorProblems from "@/components/Editor/Problems.vue";
import { EditorFindingSeverity } from "@/models/editor/EditorFindingSeverity";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("editorProblems", () => {
  // A name clash is one message against each of the two questions that share the name
  const message = crypto.randomUUID();
  const firstNodeId = crypto.randomUUID();
  const secondNodeId = crypto.randomUUID();
  // The layers tree titles a node; the id stands in for its title, so a row's title reads back the node it names
  const getNodeTitle = (nodeId: string) => nodeId;
  const findings = [
    { message, nodeId: firstNodeId, severity: EditorFindingSeverity.Error },
    { message, nodeId: secondNodeId, severity: EditorFindingSeverity.Error },
  ];

  test("The problems surface lists each finding with its node", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(EditorProblems, { props: { findings, getNodeTitle } });
    const rows = component.get('[role="dialog"]').findAll("button");

    expect(rows).toHaveLength(2);
    expect(takeOne(rows, 0).text()).toContain(firstNodeId);
    expect(takeOne(rows, 0).text()).toContain(message);
    expect(takeOne(rows, 1).text()).toContain(secondNodeId);
    expect(takeOne(rows, 1).text()).toContain(message);
  });

  test("A document with no findings shows no count", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(EditorProblems, { props: { findings: [], getNodeTitle } });

    expect(component.find("button").exists()).toBe(false);
  });

  test("Choosing a finding selects its node", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(EditorProblems, { props: { findings, getNodeTitle } });
    await takeOne(component.get('[role="dialog"]').findAll("button"), 1).trigger("click");

    expect(component.emitted("select")).toStrictEqual([[secondNodeId]]);
  });
});
