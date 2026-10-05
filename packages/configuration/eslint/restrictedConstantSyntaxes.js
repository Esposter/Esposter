// The moment a value is worth naming it is worth importing, so a fixed scalar or list sits in its feature's
// `constants.ts` and the next file that needs it finds it there, never at the top of a component or a composable
// (the file-organization skill, `references/constants.md`). The casing is what marks a fixed value, so the ban reads
// It off the name. Spread into the `.vue` override and the one scoped to `composables/` — the construct's own domain.
export default [
  {
    message:
      "A fixed value belongs in its feature's `services/.../constants.ts`, never at the top of a component or a composable. See the file-organization skill.",
    selector:
      ":matches(Program, Program > ExportNamedDeclaration) > VariableDeclaration[kind='const'] > VariableDeclarator[id.name=/^[A-Z][0-9A-Z_]+$/]",
  },
];
