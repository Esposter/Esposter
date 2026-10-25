// The persona runs under plain `node`, which strips types and takes no `enum`, so each enum becomes a const object
// Of the same members and a type of the same name, which every use of the enum reads the same way
export const toConstObject = (_match: string, name: string, body: string): string =>
  [
    `export const ${name} = {`,
    body.replaceAll(/^(?<indent>\s*)(?<key>\w+) = (?<value>.+),$/gmu, "$<indent>$<key>: $<value>,"),
    "} as const;",
    "",
    `export type ${name} = (typeof ${name})[keyof typeof ${name}];`,
  ].join("\n");
