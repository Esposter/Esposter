import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("sortClasses", () => {
  setupPluginSuite({
    fixtures: [
      {
        name: "orderedClass",
        source: `export class OrderedClass {
  [key: string]: unknown;
  static alpha = 1;
  static beta = 2;
  static get gamma() { return 1; }
  protected static delta = 1;
  protected static get epsilon() { return 1; }
  private static zeta = 1;
  private static get eta() { return 1; }
  static {
    OrderedClass.alpha = 3;
  }
  label = "a";
  value = 1;
  get first() { return 1; }
  protected guard = 2;
  protected get shield() { return 2; }
  #hidden = 4;
  #secret = 3;
  constructor() {}
  static staticMethod() {}
  protected static protectedStatic() {}
  private static privateStatic() {}
  method() {}
  read = () => [this.#secret, this.#hidden, this.#privateMethod()];
  protected protectedMethod() {}
  #privateMethod() {}
}`,
        violations: 0,
      },
      {
        name: "reversedClass",
        source: `export class ReversedClass {
  #privateMethod() {}
  protected protectedMethod() {}
  method() {}
  read = () => [this.#secret, this.#hidden, this.#privateMethod()];
  private static privateStatic() {}
  protected static protectedStatic() {}
  static staticMethod() {}
  constructor() {}
  #hidden = 4;
  #secret = 3;
  protected get shield() { return 2; }
  protected guard = 2;
  get first() { return 1; }
  value = 1;
  label = "a";
  static {
    ReversedClass.alpha = 3;
  }
  private static get eta() { return 1; }
  private static zeta = 1;
  protected static get epsilon() { return 1; }
  protected static delta = 1;
  static get gamma() { return 1; }
  static beta = 2;
  static alpha = 1;
  [key: string]: unknown;
}`,
        violations: 19,
      },
      {
        fixed: `export class A { alpha() {} beta() {} }`,
        name: "nameOrder",
        source: `export class A { beta() {} alpha() {} }`,
        violations: 1,
      },
      { name: "sortedNames", source: `export class A { alpha() {} beta() {} }`, violations: 0 },
      {
        fixed: `export class A { value = 1; method() {} }`,
        name: "propertyAfterMethod",
        source: `export class A { method() {} value = 1; }`,
        violations: 1,
      },
      { name: "propertyBeforeMethod", source: `export class A { value = 1; method() {} }`, violations: 0 },
      {
        fixed: `export class A { constructor() {} method() {} }`,
        name: "methodBeforeConstructor",
        source: `export class A { method() {} constructor() {} }`,
        violations: 1,
      },
      { name: "constructorBeforeMethod", source: `export class A { constructor() {} method() {} }`, violations: 0 },
      {
        fixed: `export class A { value = 1; constructor() {} }`,
        name: "constructorBeforeProperty",
        source: `export class A { constructor() {} value = 1; }`,
        violations: 1,
      },
      { name: "propertyBeforeConstructor", source: `export class A { value = 1; constructor() {} }`, violations: 0 },
      { name: "instanceBeforeStatic", source: `export class A { value = 1; static count = 0; }`, violations: 1 },
      { name: "staticBeforeInstance", source: `export class A { static count = 0; value = 1; }`, violations: 0 },
      { name: "staticMethodAfterMethod", source: `export class A { method() {} static other() {} }`, violations: 1 },
      { name: "staticMethodBeforeMethod", source: `export class A { static other() {} method() {} }`, violations: 0 },
      {
        fixed: `export class A { visible = 2; #hidden = 1; read = () => this.#hidden; }`,
        name: "privateBeforeVisible",
        source: `export class A { #hidden = 1; visible = 2; read = () => this.#hidden; }`,
        violations: 1,
      },
      {
        name: "visibleBeforePrivate",
        source: `export class A { visible = 2; #hidden = 1; read = () => this.#hidden; }`,
        violations: 0,
      },
      {
        name: "privateBeforeProtected",
        source: `export class A { #secret = 1; protected guard = 2; read = () => this.#secret; }`,
        violations: 1,
      },
      {
        name: "protectedBeforePrivate",
        source: `export class A { protected guard = 2; #secret = 1; read = () => this.#secret; }`,
        violations: 0,
      },
      {
        name: "getterBeforeProperty",
        source: `export class A { get value() { return 1; } label = 1; }`,
        violations: 1,
      },
      {
        name: "propertyBeforeGetter",
        source: `export class A { label = 1; get value() { return 1; } }`,
        violations: 0,
      },
      {
        fixed: `export class A { set a(value: number) {} get b() { return 1; } }`,
        name: "getSetPairUnsorted",
        source: `export class A { get b() { return 1; } set a(value: number) {} }`,
        violations: 1,
      },
      {
        name: "getSetPairSorted",
        source: `export class A { set a(value: number) {} get b() { return 1; } }`,
        violations: 0,
      },
      {
        name: "sameNameAccessors",
        source: `export class A { set x(value: number) {} get x() { return 1; } }`,
        violations: 0,
      },
      {
        name: "functionPropertyBeforeMethod",
        source: `export class A { method() {} handler = () => {}; }`,
        violations: 1,
      },
      {
        name: "functionPropertyAfterMethod",
        source: `export class A { handler = () => {}; method() {} }`,
        violations: 0,
      },
      {
        fixed: `export class A { value = 1; handler = () => {}; }`,
        name: "functionPropertyBeforeProperty",
        source: `export class A { handler = () => {}; value = 1; }`,
        violations: 1,
      },
      {
        name: "propertyBeforeFunctionProperty",
        source: `export class A { value = 1; handler = () => {}; }`,
        violations: 0,
      },
      {
        fixed: `export abstract class A { abstract name: string; abstract run(): void; }`,
        name: "abstractMethodBeforeProperty",
        source: `export abstract class A { abstract run(): void; abstract name: string; }`,
        violations: 1,
      },
      {
        name: "abstractPropertyBeforeMethod",
        source: `export abstract class A { abstract name: string; abstract run(): void; }`,
        violations: 0,
      },
      {
        name: "privateMethodBeforePublic",
        source: `export class A { read = () => this.#helper(); #helper() {} public() {} }`,
        violations: 1,
      },
      {
        name: "publicBeforePrivateMethod",
        source: `export class A { public() {} read = () => this.#helper(); #helper() {} }`,
        violations: 0,
      },
      {
        name: "staticBlockAfterProperty",
        source: `export class A { value = 1; static { A.value = 2; } }`,
        violations: 0,
      },
      {
        name: "staticBlockBeforeProperty",
        source: `export class A { static { A.value = 2; } value = 1; }`,
        violations: 0,
      },
      {
        fixed: `export class A { [key: string]: unknown; value = 1; }`,
        name: "indexSignatureAfterProperty",
        source: `export class A { value = 1; [key: string]: unknown; }`,
        violations: 1,
      },
      {
        name: "indexSignatureBeforeProperty",
        source: `export class A { [key: string]: unknown; value = 1; }`,
        violations: 0,
      },
      {
        fixed: `export class A { plain = 2; accessor value = 1; }`,
        name: "accessorSameGroupUnsorted",
        source: `export class A { accessor value = 1; plain = 2; }`,
        violations: 1,
      },
      { name: "accessorSameGroupSorted", source: `export class A { plain = 2; accessor value = 1; }`, violations: 0 },
      {
        fixed: `export class A { b = 1; a = this.b; }`,
        name: "dependencyBeforeProvider",
        source: `export class A { a = this.b; b = 1; }`,
        violations: 1,
      },
      { name: "dependencyAfterProvider", source: `export class A { b = 1; a = this.b; }`, violations: 0 },
      {
        fixed: `export class A { a = 1; b = this.a; c = this.b; }`,
        name: "dependencyChain",
        source: `export class A { c = this.b; b = this.a; a = 1; }`,
        violations: 2,
      },
      { name: "deferredThisRead", source: `export class A { a = { run: () => this.b }; b = 1; }`, violations: 0 },
      { name: "callbackThisRead", source: `export class A { a = [1].map(() => this.b); b = 1; }`, violations: 1 },
      {
        fixed: `export class Lazy { static b = 1; static a = Lazy.b; }`,
        name: "classNameRead",
        source: `export class Lazy { static a = Lazy.b; static b = 1; }`,
        violations: 1,
      },
      { name: "classNameReadSorted", source: `export class Lazy { static b = 1; static a = Lazy.b; }`, violations: 0 },
      {
        fixed: `export class A { #b = 1; a = this.#b; }`,
        name: "privateDependencyBeforeProvider",
        source: `export class A { a = this.#b; #b = 1; }`,
        violations: 1,
      },
      { name: "privateDependencyAfterProvider", source: `export class A { #b = 1; a = this.#b; }`, violations: 0 },
      { name: "dependencyCycle", source: `export class A { a = this.b; b = this.a; }`, violations: 0 },
      { name: "impureComputedKeysKeepTheirPlaces", source: `export class A { [g()]() {} [f()]() {} }`, violations: 0 },
      {
        name: "nestedClassThisIsNotOurs",
        source: `export class A { a = class { y = this.b }; b = 1; }`,
        violations: 0,
      },
      {
        name: "computedIdentifierReadIsNoDependency",
        source: `export class A { a = this[key]; key = "b"; }`,
        violations: 0,
      },
      {
        name: "computedLiteralReadIsDependency",
        source: `export class A { a = this["key"]; key = "b"; }`,
        violations: 1,
      },
      { name: "twoMethodsSorted", source: `export class A { a() {} b() {} c() {} }`, violations: 0 },
      {
        name: "privateNamesUnsorted",
        source: `export class A { read = () => [this.#a(), this.#b()]; #b() {} #a() {} }`,
        violations: 1,
      },
      {
        name: "privateNamesSorted",
        source: `export class A { read = () => [this.#a(), this.#b()]; #a() {} #b() {} }`,
        violations: 0,
      },
      { name: "classExpression", source: `export const Expressed = class { b() {} a() {} };`, violations: 1 },
      { name: "computedKeyFirst", source: `export class A { alpha() {} [Symbol.iterator]() {} }`, violations: 0 },
      {
        fixed: `export class A { alpha() {} [Symbol.iterator]() {} }`,
        name: "computedKeyLast",
        source: `export class A { [Symbol.iterator]() {} alpha() {} }`,
        violations: 1,
      },
      { name: "literalKeys", source: `export class A { "b-key"() {} "a-key"() {} }`, violations: 1 },
      {
        name: "modifiersDoNotChangeGroup",
        source: `export class A { readonly b = 1; declare a: string; }`,
        violations: 1,
      },
      {
        name: "privateStaticAfterPrivate",
        source: `export class A { #helper() {} static #other() {} run = () => [this.#helper(), A.#other()]; }`,
        violations: 1,
      },
      {
        name: "privateStaticBeforeStatic",
        source: `export class A { static #other() {} static run = () => A.#other(); }`,
        violations: 1,
      },
      {
        name: "staticDependencyBeforeProvider",
        source: `export class A { static a = this.b; static b = 1; }`,
        violations: 1,
      },
      {
        name: "staticDependencyAfterProvider",
        source: `export class A { static b = 1; static a = this.b; }`,
        violations: 0,
      },
      { name: "instanceReadsStaticName", source: `export class A { static b = 1; a = this.b; }`, violations: 0 },
      {
        fixed: `export class A { static b = 1; a = this.b; }`,
        name: "instanceReadsStaticNameReversed",
        source: `export class A { a = this.b; static b = 1; }`,
        violations: 1,
      },
      {
        fixed: `export class Cycle {
  a = this.b;
  b = this.d;
  c = 1;
  d = this.b + this.a + this.c;
}`,
        name: "cycleThroughFinishedNodeIsCircular",
        source: `export class Cycle {
  c = 1;
  d = this.b + this.a + this.c;
  a = this.b;
  b = this.d;
}`,
        violations: 1,
      },
      {
        name: "impureFieldKeepsItsPlace",
        source: `export class A {
  b = next();
  a = 1;
}`,
        violations: 0,
      },
    ],
    plugin: "sorting",
    rules: ["sorting/sort-classes"],
  });
});
