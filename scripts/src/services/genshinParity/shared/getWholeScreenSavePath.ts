import { join } from "node:path";

// The path a whole-screen image is saved at in a directory: its file title without the `File:` namespace, spaces as
// Underscores, its own extension kept
export const getWholeScreenSavePath = (directory: string, title: string): string =>
  join(directory, title.replace(/^File:/u, "").replaceAll(" ", "_"));
