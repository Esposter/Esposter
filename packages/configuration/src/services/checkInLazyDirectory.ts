// Whether a `src`-relative path lies under one of the lazy directories, which a package loads through an `import()` of its own
export const checkInLazyDirectory = (path: string, lazyDirectories: string[]): boolean =>
  lazyDirectories.some((directory) => path.startsWith(`${directory}/`));
