// Whether a barrel leaves a `src`-relative path out: the module named exactly, or a module under a folder named. Those are
// A lazy directory the package loads through an `import()` of its own, and a subpath entry's module or folder, which its
// Own entry reaches
export const checkExcluded = (path: string, excludedPaths: string[]): boolean =>
  excludedPaths.some((excludedPath) => path === excludedPath || path.startsWith(`${excludedPath}/`));
