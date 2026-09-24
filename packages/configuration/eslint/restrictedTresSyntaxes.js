// Vue-only. A component that draws with Tres imports `three` or `@tresjs/*` for the types its refs and handlers
// Take, which is the one syntactic signal that a template ref in it may point at a Three object rather than an
// Element — the template's `ref` and the script's call live in two ASTs no single rule reads together.
export default [
  {
    message:
      "Use `useTresTemplateRef` in a component that draws with Tres — `useTemplateRef` reads back through a deep readonly proxy in development, so a Three object reached through it cannot be moved.",
    selector:
      "Program:has(ImportDeclaration[source.value=/^(three|@tresjs\\/)/u]) CallExpression[callee.name='useTemplateRef']",
  },
];
