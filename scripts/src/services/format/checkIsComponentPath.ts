import { extname } from "node:path";

// Whether a path is a component, which `vize fmt` formats and oxfmt ignores, so the scripts route it to vize
export const checkIsComponentPath = (path: string): boolean => extname(path) === ".vue";
