import { getSourceSpecifiers } from "#src/services/getSourceSpecifiers";
import { writeBarrel } from "#src/services/writeBarrel";

export const generateSourceBarrel = (sourceDirectory: string, lazyDirectories: string[]): void => {
  // Each module keeps its `.ts` extension, which a bundler takes as it is and which node's own resolution — the one the
  // App's configuration loads and typechecks under — requires of a relative import
  writeBarrel(
    sourceDirectory,
    getSourceSpecifiers(sourceDirectory, lazyDirectories),
    (specifier) => `export * from "./${specifier}";`,
  );
};
