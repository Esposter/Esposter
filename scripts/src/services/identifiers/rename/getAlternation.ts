export const getAlternation = (names: Iterable<string>): string =>
  Array.from(names, (name) => RegExp.escape(name))
    .toSorted((firstName, secondName) => secondName.length - firstName.length)
    .join("|");
