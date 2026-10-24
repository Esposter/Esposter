import { patchEdge } from "@/services/flowchartEditor/patchEdge";
import { ConnectionLineType } from "@vue-flow/core";
import { describe, expect, test } from "vitest";

describe(patchEdge, () => {
  const straightEdge = { id: "a", label: "old", type: ConnectionLineType.Straight };
  const bezierEdge = { id: "b", label: "other", type: ConnectionLineType.Bezier };

  test("lays the patch over the edge it names and keeps its other fields", () => {
    expect.hasAssertions();

    const [patchedEdge] = patchEdge([straightEdge, bezierEdge], "a", { label: "new" });

    expect(patchedEdge).toStrictEqual({ id: "a", label: "new", type: ConnectionLineType.Straight });
  });

  test("returns every other edge as it was", () => {
    expect.hasAssertions();

    const [, otherEdge] = patchEdge([straightEdge, bezierEdge], "a", { label: "new" });

    expect(otherEdge).toBe(bezierEdge);
  });
});
