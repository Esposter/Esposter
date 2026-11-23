export const TYPE_OVER_VALUE_MESSAGE = "All imports in the declaration are only used as types. Use `import type`.";

// The names are the bindings to type, so the message names the imports the fix moves
export const buildSomeImportsAreOnlyTypesMessage = (names: string[]): string =>
  `Imports ${names.map((name) => `"${name}"`).join(", ")} are only used as type. Use \`import type\`.`;
