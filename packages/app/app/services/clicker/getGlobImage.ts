import { filename } from "pathe/utils";

export const getGlobImage = (glob: Record<string, string>, id: string) =>
  Object.fromEntries(Object.entries(glob).map(([path, value]) => [filename(path), value]))[id];
