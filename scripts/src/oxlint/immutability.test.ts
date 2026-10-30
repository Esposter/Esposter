import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("immutability", () => {
  const RULE = "immutability/no-map-mutation";
  // Every fixture exports what it declares, so the correctness category oxlint keeps on reports nothing else.
  const FIXTURES = [
    {
      name: "propertyAssignment",
      source: `export const rows = items.map((item) => { item.a = 1; return item; });`,
      violations: 1,
    },
    {
      name: "nestedPropertyAssignment",
      source: `export const rows = items.map((item) => { item.a.b = 1; return item; });`,
      violations: 1,
    },
    {
      name: "compoundAssignment",
      source: `export const rows = items.map((item) => { item.a += 1; return item; });`,
      violations: 1,
    },
    { name: "update", source: `export const rows = items.map((item) => { item.a++; return item; });`, violations: 1 },
    {
      name: "delete",
      source: `export const rows = items.map((item) => { delete item.a; return item; });`,
      violations: 1,
    },
    {
      name: "flatMap",
      source: `export const rows = items.flatMap((item) => { item.a = 1; return [item]; });`,
      violations: 1,
    },
    {
      name: "functionExpression",
      source: `export const rows = items.map(function (item) { item.a = 1; return item; });`,
      violations: 1,
    },
    {
      name: "nestedClosure",
      source: `export const rows = items.map((item) => { const set = () => { item.a = 1; }; set(); return item; });`,
      violations: 1,
    },
    {
      name: "shadowedParameter",
      source: `export const rows = items.map((item) => { const set = (item) => { item.a = 1; }; set(item); return { ...item }; });`,
      violations: 0,
    },
    {
      name: "destructuredShadowedParameter",
      source: `export const rows = items.map((item) => { const set = ({ item }) => { item.a = 1; }; set({ item: {} }); return { ...item }; });`,
      violations: 0,
    },
    {
      name: "restShadowedParameter",
      source: `export const rows = items.map((item) => { const set = (...item) => { item[0].a = 1; }; set({}); return { ...item }; });`,
      violations: 0,
    },
    {
      name: "nestedFunctionDeclaration",
      source: `export const rows = items.map((item) => { function set() { item.a = 1; } set(); return item; });`,
      violations: 1,
    },
    {
      name: "shadowedFunctionDeclarationParameter",
      source: `export const rows = items.map((item) => { function set(item) { item.a = 1; } set({}); return { ...item }; });`,
      violations: 0,
    },
    // A new object, a projection and a local built inside the callback never write to the element.
    { name: "spreadCopy", source: `export const rows = items.map((item) => ({ ...item, a: 1 }));`, violations: 0 },
    {
      name: "localObject",
      source: `export const rows = items.map((item) => { const row = {}; row.a = item.a; return row; });`,
      violations: 0,
    },
    {
      name: "outerVariable",
      source: `export const rows = items.map((item) => { total.sum += item.a; return item.a; });`,
      violations: 0,
    },
    // Only a projecting callback is checked: a loop callback may write, and its element is not the result.
    { name: "forEach", source: `export const rows = items.forEach((item) => { item.a = 1; });`, violations: 0 },
    {
      name: "shadowedAfterCallback",
      source: `export const rows = items.map((item) => item.a); export const other = (item) => { item.a = 1; };`,
      violations: 0,
    },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "immutability", rules: [RULE] });
});
