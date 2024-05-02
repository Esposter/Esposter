export const generateEnumString = (name: string, members: string[]) =>
  members.length === 0
    ? `export enum ${name} {}\n`
    : [`export enum ${name} {`, members.map((m) => `  ${m} = "${m}",`).join("\n"), "}\n"].join("\n");
