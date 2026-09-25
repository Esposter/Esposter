// Vue-only, in script and template alike. A component hands raw input to the tRPC boundary, whose Zod schema
// Normalizes it; trimming here as well swallows a space the user is still typing and duplicates a transform the
// Server already owns. Parsing a string is not a component's job either, so it moves to a service, where trimming is
// Allowed.
export default [
  {
    message:
      "Never trim in a component — the tRPC input schema normalizes what a component sends, and a string the component parses belongs in a service. See the vue skill.",
    selector: "ImportSpecifier[imported.name='normalizeString']",
  },
  {
    message:
      "Never trim in a component — the tRPC input schema normalizes what a component sends, and a string the component parses belongs in a service. See the vue skill.",
    selector: "CallExpression[callee.property.name=/^trim(End|Start)?$/u]",
  },
];
