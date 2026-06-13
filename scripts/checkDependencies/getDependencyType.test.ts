import { getDependencyType } from "@/checkDependencies/getDependencyType";
import { describe, expect, test } from "vitest";

describe(getDependencyType, () => {
  test("maps devDependencies to dev", () => {
    expect.hasAssertions();

    expect(getDependencyType("devDependencies")).toBe("dev");
  });

  test("maps optionalDependencies to optional", () => {
    expect.hasAssertions();

    expect(getDependencyType("optionalDependencies")).toBe("optional");
  });

  test("maps peerDependencies to peer", () => {
    expect.hasAssertions();

    expect(getDependencyType("peerDependencies")).toBe("peer");
  });

  test("maps regular and unknown fields to an empty label", () => {
    expect.hasAssertions();

    expect(getDependencyType("dependencies")).toBe("");
    expect(getDependencyType("")).toBe("");
  });
});
