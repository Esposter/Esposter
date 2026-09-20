import type { PersonaReference } from "@esposter/genshin-persona/src/models/PersonaReference.ts";

const IDENTIFIER_REGEX = /^[A-Za-z_$][\w$]*$/u;

// The generated map's source, in the formatter's own shape so a format pass leaves it alone: one line per
// Character in name order, the name quoted only where it is not an identifier
export const getPersonaReferenceMapSource = (references: Map<string, PersonaReference>): string => {
  const entries = [...references]
    .toSorted(([a], [b]) => a.localeCompare(b))
    .map(
      ([name, { likeness, stem }]) =>
        `  ${IDENTIFIER_REGEX.test(name) ? name : JSON.stringify(name)}: { likeness: ${likeness}, stem: ${JSON.stringify(stem)} },\n`,
    );
  return `import type { PersonaReference } from "#src/models/PersonaReference";

export const PersonaReferenceMap: Record<string, PersonaReference> = {
${entries.join("")}};
`;
};
