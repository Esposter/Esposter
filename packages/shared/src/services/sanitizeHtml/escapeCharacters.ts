const NON_BREAKING_SPACE = String.fromCodePoint(0xa0);

// Each character the regex finds becomes the entity the table names for it, and each no-break space becomes `&nbsp;`
export const escapeCharacters = (value: string, charactersRegex: RegExp, entities: Record<string, string>): string =>
  value
    .replace(charactersRegex, (character) => entities[character] ?? character)
    .replaceAll(NON_BREAKING_SPACE, "&nbsp;");
