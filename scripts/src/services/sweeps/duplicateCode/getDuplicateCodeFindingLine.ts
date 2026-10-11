import type { DuplicateCodeFinding } from "#src/models/sweeps/duplicateCode/DuplicateCodeFinding";

// One line per finding, the duplicated line count first so the largest run reads at the top of a list.
export const getDuplicateCodeFindingLine = ({ lines, paths: [firstPath, secondPath] }: DuplicateCodeFinding): string =>
  `${lines} ${firstPath} | ${secondPath}`;
