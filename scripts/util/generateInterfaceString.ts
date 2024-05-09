import type { InterfaceMember } from "@/scripts/models/InterfaceMember";
import { startsWithNumber } from "@/util/regex/startsWithNumber";

export const generateInterfaceString = (name: string, members: InterfaceMember[]) =>
  members.length === 0
    ? `export interface ${name} {}\n`
    : [
        `export interface ${name} {`,
        members.map(({ name, type }) => `  ${startsWithNumber(name) ? `"@${name}"` : name}: ${type};`).join("\n"),
        "}\n",
      ].join("\n");
