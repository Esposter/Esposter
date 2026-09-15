// `.ts` only, which is why it is its own list rather than one of `restrictedSyntaxes`: an SFC's `<script setup>`
// Top level is the component instance's own scope, where a `ref` is exactly right, and `typescriptRules` is
// Spread into the `.vue` override too. In a `.ts` module the same position is module scope — evaluated once per
// Process, so on the server once per every request.
export default [
  {
    // A `ref` at module scope is process-wide state every caller shares, and it announces none of that. Shared
    // Reactive state is a Pinia store; module scope is for constants and `markRaw`ed instances
    // (vue-composable-patterns). Exported or not, since either reaches the whole process.
    message:
      "A reactive value at module scope is a singleton every caller and every server request shares — put it in a Pinia store. See the vue-composable-patterns skill.",
    selector:
      ":matches(Program, Program > ExportNamedDeclaration) > VariableDeclaration > VariableDeclarator > CallExpression[callee.name=/^(ref|shallowRef|reactive|shallowReactive|computed)$/]",
  },
];
