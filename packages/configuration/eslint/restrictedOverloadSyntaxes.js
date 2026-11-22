// An overload is trusted rather than checked: the compiler never verifies that the implementation returns each
// Signature's narrowed type, so every overload is a cast in disguise. One-or-many input is two functions, a batch and a
// Single read over it, each with its exact type. A `declare` function and one inside a `declare module` block are
// Ambient, and augmenting a third-party API that is already overloaded needs them, so both are left alone. A `.d.ts`
// File is exempt through its own override in the entry configs, which drops these entries from its list
export default [
  {
    message:
      "Overloads are banned — write one function per call shape, each with its own exact type (a batch and a single read over it). See the typescript skill's references/function-signatures.md.",
    selector: "TSDeclareFunction:not([declare=true]):not(TSModuleDeclaration[declare=true] TSDeclareFunction)",
  },
  {
    // The same trust in an interface or a type literal: a second call signature is an overload of the first, so the
    // Callable is one checked type only with the one
    message:
      "Overloads are banned — a second call signature is an overload. Write one function per call shape, each with its own exact type. See the typescript skill's references/function-signatures.md.",
    selector:
      "TSCallSignatureDeclaration ~ TSCallSignatureDeclaration:not(TSModuleDeclaration[declare=true] TSCallSignatureDeclaration)",
  },
  {
    // A method with no body in a class is an overload signature, since the implementation is the one with a body. An
    // Abstract method is a different node, and two abstract methods of different names are not overloads of each other
    // Either, so no selector names an abstract overload
    message:
      "Overloads are banned — a class method's overload signatures are one method per call shape, each with its own exact type. See the typescript skill's references/function-signatures.md.",
    selector:
      "MethodDefinition[value.type=TSEmptyBodyFunctionExpression]:not(TSModuleDeclaration[declare=true] MethodDefinition)",
  },
];
