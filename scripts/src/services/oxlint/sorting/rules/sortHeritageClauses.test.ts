import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("sortHeritageClauses", () => {
  setupPluginSuite({
    fixtures: [
      {
        fixed: `export interface A {}\nexport interface B {}\nexport class C implements A, B {}`,
        name: "unsortedImplements",
        source: `export interface A {}\nexport interface B {}\nexport class C implements B, A {}`,
        violations: 1,
      },
      {
        fixed: `export interface A {}\nexport interface B {}\nexport interface C extends A, B {}`,
        name: "unsortedExtends",
        source: `export interface A {}\nexport interface B {}\nexport interface C extends B, A {}`,
        violations: 1,
      },
      {
        name: "sortedImplements",
        source: `export interface A {}\nexport interface B {}\nexport class C implements A, B {}`,
        violations: 0,
      },
      {
        name: "memberNameSortsByLastSegment",
        source: `import * as ns from "x";\nexport interface B {}\nexport class C implements ns.B, A {}`,
        violations: 1,
      },
      {
        name: "genericClauseByName",
        source: `export interface B<T> { value: T }\nexport interface A<T> { value: T }\nexport class C implements B<number>, A<number> {}`,
        violations: 1,
      },
      {
        fixed: `export interface A {}\nexport interface B {}\nexport const C = class implements A, B {};`,
        name: "unsortedClassExpressionImplements",
        source: `export interface A {}\nexport interface B {}\nexport const C = class implements B, A {};`,
        violations: 1,
      },
    ],
    plugin: "sorting",
    rules: ["sorting/sort-heritage-clauses"],
  });
});
