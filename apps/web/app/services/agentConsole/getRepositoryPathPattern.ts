export const getRepositoryPathPattern = (files: readonly string[]) =>
  new RegExp(
    `(?<![\\w./-])(${files
      .toSorted((left, right) => right.length - left.length)
      .map((file) => RegExp.escape(file))
      .join("|")})(?![\\w./-])`,
    "gu",
  );
