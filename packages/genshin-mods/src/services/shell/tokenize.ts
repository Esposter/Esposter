const TOKEN_REGEX = /"(?<double>[^"]*)"|'(?<single>[^']*)'|(?<bare>\S+)/gu;

// A quoted argument keeps its inner spaces, so a shell command passed as one argument is read again on its own
export const tokenize = (segment: string) =>
  Array.from(
    segment.matchAll(TOKEN_REGEX),
    (match) => match.groups?.double ?? match.groups?.single ?? match.groups?.bare ?? "",
  );
