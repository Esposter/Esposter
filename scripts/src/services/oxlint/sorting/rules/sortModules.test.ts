import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

// The declarations a group fixture keeps unexported, so each stays in its group, are read by one export list at the
// End, which is a statement sort-modules does not read and so no partition
const GROUP_EXPORTS =
  "export { PlainEnum, DeclaredType, PlainInterface, PlainType, DeclaredClass, PlainClass, declaredFunction, plainFunction };";

describe("sortModules", () => {
  setupPluginSuite({
    fixtures: [
      {
        fixed: `export class C {}\nexport function f() {}`,
        name: "groupOrder",
        source: `export function f() {}\nexport class C {}`,
        violations: 1,
      },
      { name: "groupOrderSorted", source: `export class C {}\nexport function f() {}`, violations: 0 },
      {
        fixed: [
          "export declare enum DeclaredEnum { A }",
          "export enum ExportedEnum { A }",
          "enum PlainEnum { A }",
          "declare type DeclaredType = string;",
          "export interface ExportedInterface {}",
          "export type ExportedType = string;",
          "interface PlainInterface {}",
          "type PlainType = string;",
          "declare class DeclaredClass {}",
          "class PlainClass {}",
          "export class ExportedClass {}",
          "declare function declaredFunction(): void;",
          "export function exportedFunction() {}",
          "function plainFunction() {}",
          GROUP_EXPORTS,
        ].join("\n"),
        name: "everyGroupReversed",
        source: [
          "function plainFunction() {}",
          "export function exportedFunction() {}",
          "declare function declaredFunction(): void;",
          "export class ExportedClass {}",
          "class PlainClass {}",
          "declare class DeclaredClass {}",
          "type PlainType = string;",
          "interface PlainInterface {}",
          "export type ExportedType = string;",
          "export interface ExportedInterface {}",
          "declare type DeclaredType = string;",
          "enum PlainEnum { A }",
          "export enum ExportedEnum { A }",
          "export declare enum DeclaredEnum { A }",
          GROUP_EXPORTS,
        ].join("\n"),
        violations: 13,
      },
      {
        name: "everyGroupSorted",
        source: [
          "export declare enum DeclaredEnum { A }",
          "export enum ExportedEnum { A }",
          "enum PlainEnum { A }",
          "declare type DeclaredType = string;",
          "export interface ExportedInterface {}",
          "export type ExportedType = string;",
          "interface PlainInterface {}",
          "type PlainType = string;",
          "declare class DeclaredClass {}",
          "class PlainClass {}",
          "export class ExportedClass {}",
          "declare function declaredFunction(): void;",
          "export function exportedFunction() {}",
          "function plainFunction() {}",
          GROUP_EXPORTS,
        ].join("\n"),
        violations: 0,
      },
      {
        fixed: `export class A {}\nexport class B {}`,
        name: "nameOrder",
        source: `export class B {}\nexport class A {}`,
        violations: 1,
      },
      { name: "nameOrderSorted", source: `export class A {}\nexport class B {}`, violations: 0 },
      {
        fixed: `export interface SetupVizeEntrySuiteOptions {}\nexport interface VizeEntryFixture {}`,
        name: "interfaceNames",
        source: `export interface VizeEntryFixture {}\nexport interface SetupVizeEntrySuiteOptions {}`,
        violations: 1,
      },
      {
        name: "interfaceNamesSorted",
        source: `export interface SetupVizeEntrySuiteOptions {}\nexport interface VizeEntryFixture {}`,
        violations: 0,
      },
      {
        name: "variableSplitsPartitions",
        source: `export class B {}\nexport const value = 1;\nexport class A {}`,
        violations: 0,
      },
      {
        name: "expressionSplitsPartitions",
        source: `export class B {}\nconsole.log("start");\nexport class A {}`,
        violations: 0,
      },
      {
        fixed: `export class A {}\nimport "value";\nexport class B {}`,
        name: "importKeepsPartition",
        source: `export class B {}\nimport "value";\nexport class A {}`,
        violations: 1,
      },
      {
        fixed: `export class Z {}\nexport class A extends Z {}`,
        name: "classExtendsLater",
        source: `export class A extends Z {}\nexport class Z {}`,
        violations: 1,
      },
      { name: "classExtendsEarlier", source: `export class Z {}\nexport class A extends Z {}`, violations: 0 },
      {
        fixed: `export class Z {}\nexport class A {\n  value = new Z();\n}`,
        name: "propertyReadsLater",
        source: `export class A {\n  value = new Z();\n}\nexport class Z {}`,
        violations: 1,
      },
      {
        name: "methodBodyReadsLater",
        source: `export class A {\n  method() {\n    return new Z();\n  }\n}\nexport class Z {}`,
        violations: 0,
      },
      {
        name: "typeAnnotationReadsLater",
        source: `export class A {\n  value: Z;\n}\nexport class Z {}`,
        violations: 0,
      },
      {
        name: "functionReadsLater",
        source: `export function a() {\n  return z();\n}\nexport function z() {}`,
        violations: 0,
      },
      {
        fixed: `export enum Z {\n  Y = 1,\n}\nexport enum E {\n  A = Z.Y,\n}`,
        name: "enumReadsLater",
        source: `export enum E {\n  A = Z.Y,\n}\nexport enum Z {\n  Y = 1,\n}`,
        violations: 1,
      },
      {
        name: "dependencyAcrossPartition",
        source: `export class B extends A {}\nexport const unused = 1;\nexport class A {}`,
        violations: 0,
      },
      {
        fixed: `class A {}\nexport default class B {}\nexport { A };`,
        name: "defaultExportClass",
        source: `export default class B {}\nclass A {}\nexport { A };`,
        violations: 1,
      },
      {
        name: "unnamedDefaultFunctionEndsPartition",
        source: `export function B() {}\nexport default function () {}\nexport function A() {}`,
        violations: 0,
      },
      {
        fixed: `declare class B {}\nclass A {}\nexport { A, B };`,
        name: "declaredClass",
        source: `class A {}\ndeclare class B {}\nexport { A, B };`,
        violations: 1,
      },
      {
        fixed: `declare module "x" {\n  export interface A {}\n  export interface B {}\n}`,
        name: "ambientModuleBody",
        source: `declare module "x" {\n  export interface B {}\n  export interface A {}\n}`,
        violations: 1,
      },
      {
        name: "functionPropertyReadsLater",
        source: `export class A {\n  f = function () {\n    return B;\n  };\n}\nexport class B {}`,
        violations: 0,
      },
      {
        fixed: `export class A {}
@Dec()
export class B {}`,
        name: "decoratedDeclarationMovesWithItsDecorator",
        source: `@Dec()
export class B {}
export class A {}`,
        violations: 1,
      },
      {
        name: "decoratorReadIsDependencyOfExportedClass",
        source: `export class Z {}\n@Dec(Z) export class A {}`,
        violations: 0,
      },
    ],
    plugin: "sorting",
    rules: ["sorting/sort-modules"],
  });
});
