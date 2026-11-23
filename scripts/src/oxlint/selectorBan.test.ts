import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("selectorBan", () => {
  const RULE = "selector-ban/no-restricted-syntax";
  // One row per selector shape the lint lists write, with the source that plants it and a source that does not.
  // Every shape shares one configuration, so each source is also checked against the other shapes' selectors: its
  // Count is the number of bans it trips, which is 1 only when no other shape claims the same construct
  const SHAPES = [
    {
      name: "attributeEquality",
      passing: "export const a = createOther(() => 1);",
      selector: "CallExpression[callee.name='createSharedComposable']",
      violating: "export const a = createSharedComposable(() => 1);",
    },
    {
      name: "attributeRegex",
      passing: "export const a = promise.map(() => 1);",
      selector: "CallExpression[callee.property.name=/^(catch|finally|then)$/]",
      violating: "export const a = promise.then(() => 1);",
    },
    {
      name: "nestedAttributePath",
      passing: 'export const a = useOther().replace("x");',
      selector: "CallExpression[callee.object.callee.name='useRouter']",
      violating: 'export const a = useRouter().replace("x");',
    },
    {
      name: "notInFunction",
      passing: "export const a = () => window.sessionStorage;",
      selector: "MemberExpression[object.name='window'][property.name!='localStorage']:not(:function *)",
      violating: "export const a = window.sessionStorage;",
    },
    {
      name: "numericComparison",
      passing: "export const a = g(1, 2);",
      selector: "CallExpression[arguments.length>=3]",
      violating: "export const a = g(1, 2, 3);",
    },
    {
      name: "booleanAttributeInChild",
      passing: "export const a = watch(b, { deep: false });",
      selector:
        "CallExpression[callee.name='watch'] > ObjectExpression > Property[key.name=/^(deep|immediate)$/][value.value=true]",
      violating: "export const a = watch(b, { deep: true });",
    },
    {
      name: "nullAttribute",
      passing: "export const a = 1;",
      selector: "Literal[value=null]",
      violating: "export const a = null;",
    },
    {
      name: "presenceAttribute",
      passing: "export class A { c = 1; }",
      selector: "ClassDeclaration[superClass]",
      violating: "export class A extends B { c = 1; }",
    },
    {
      name: "descendantWithNot",
      passing: "export const a = onMounted(() => b.focus(c.chain()));",
      selector:
        "CallExpression[callee.name='onMounted'] CallExpression[callee.property.name='focus']:not(:has(CallExpression[callee.property.name='chain']))",
      violating: "export const a = onMounted(() => b.focus());",
    },
    {
      name: "childCombinator",
      passing: "export const a = b.toString();",
      selector: "TemplateLiteral > CallExpression[callee.property.name='toString'][arguments.length=0]",
      // oxlint-disable-next-line no-template-curly-in-string -- the fixture is source text, which holds a template literal
      violating: "export const a = `${b.toString()}`;",
    },
    {
      name: "fieldAndIndexPath",
      passing: 'export const a = z.enum(["x"]);',
      selector:
        "VariableDeclarator > CallExpression.init[callee.object.name='z'][callee.property.name='enum'][arguments.0.type='Identifier']",
      violating: "export const a = z.enum(b);",
    },
    {
      name: "functionClassChild",
      passing: "export const a = (c) => c;",
      selector: ":function > Identifier.params[name='_']",
      violating: "export const a = (_) => _;",
    },
    {
      name: "nthChild",
      passing: "export const a = h(1);",
      selector: "CallExpression[callee.name='h'] > Literal:nth-child(2)",
      violating: "export const a = h(1, 2);",
    },
    {
      name: "siblingCombinator",
      passing: "export interface A { (a: string): void; }",
      selector:
        "TSCallSignatureDeclaration ~ TSCallSignatureDeclaration:not(TSModuleDeclaration[declare=true] TSCallSignatureDeclaration)",
      violating: "export interface A { (a: string): void; (a: number): void; }",
    },
    {
      name: "overloadOutsideDeclare",
      passing: 'declare module "c" { export function a(b: string): void; }',
      selector: "TSDeclareFunction:not([declare=true]):not(TSModuleDeclaration[declare=true] TSDeclareFunction)",
      violating: "export function a(b: string): void;",
    },
    {
      name: "commaList",
      passing: "export const a = baz();",
      selector: "CallExpression[callee.name='foo'], NewExpression[callee.name='Bar']",
      violating: "export const a = new Bar();",
    },
    {
      name: "matchesAlternation",
      passing: "export const maxSize = 1;",
      selector:
        ":matches(Program, Program > ExportNamedDeclaration) > VariableDeclaration[kind='const'] > VariableDeclarator[id.name=/^[A-Z][0-9A-Z_]+$/]",
      violating: "export const MAX_SIZE = 1;",
    },
    {
      name: "bareNodeType",
      passing: "export const a = () => b();",
      selector: "TryStatement",
      violating: "export const a = () => { try { b(); } finally { c(); } };",
    },
  ];
  const BANS = SHAPES.map(({ name, selector }) => ({ message: name, selector }));
  const FIXTURES = SHAPES.flatMap(({ name, passing, violating }) => [
    { name, source: violating, violations: 1 },
    { name: `${name}Passes`, source: passing, violations: 0 },
  ]);

  describe("choosing the mechanism for a ban", () => {
    setupPluginSuite({ fixtures: FIXTURES, options: BANS, plugin: "selectorBan", rules: [RULE] });
  });

  // The plugin sees a component's script and never its template, so a template selector is not run here and its ban
  // Belongs to the template pass. The script fixture proves the suite does run, so the template's zero is not a
  // Plugin that reports nothing
  describe("a selector ban the plugin cannot run", () => {
    setupPluginSuite({
      extension: ".vue",
      fixtures: [
        {
          name: "templateAutofocus",
          source: '<template><input autofocus /></template>\n<script setup lang="ts">export const a = 1;</script>',
          violations: 0,
        },
        {
          name: "scriptNull",
          source: '<template><div /></template>\n<script setup lang="ts">export const a = null;</script>',
          violations: 1,
        },
      ],
      options: [{ message: "templateAutofocus", selector: "VAttribute[key.name='autofocus']" }, "Literal[value=null]"],
      plugin: "selectorBan",
      rules: [RULE],
    });
  });
});
