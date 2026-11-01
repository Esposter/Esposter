import { patchEdge } from "@/services/flowchartEditor/patchEdge";
import { ConnectionLineType } from "@vue-flow/core";
import { describe, expect, test } from "vitest";

describe(patchEdge, () => {
  const straightEdge = { id: "a", label: "a", type: ConnectionLineType.Straight };
  const bezierEdge = { id: "b", label: "b", type: ConnectionLineType.Bezier };

  test("lays the patch over the edge it names and keeps its other fields", () => {
    expect.hasAssertions();

    const [patchedEdge] = patchEdge([straightEdge, bezierEdge], "a", { label: "c" });

    expect(patchedEdge).toStrictEqual({ id: "a", label: "c", type: ConnectionLineType.Straight });
  });

  test("returns every other edge as it was", () => {
    expect.hasAssertions();

    const [, otherEdge] = patchEdge([straightEdge, bezierEdge], "a", { label: "c" });

    expect(otherEdge).toBe(bezierEdge);
  });
});
