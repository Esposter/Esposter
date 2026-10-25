import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { relative, sep } from "node:path";

export const getPath = (sourceId: string, line: number): string =>
  `${relative(REPOSITORY_ROOT, sourceId).split(sep).join("/")}:${line}`;
