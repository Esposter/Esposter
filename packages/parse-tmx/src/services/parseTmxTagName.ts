import { TMXTagName } from "#src/models/tmx/TMXTagName";

// The tag of an element the reader models, or undefined for one it does not: a child it does not model is skipped
export const parseTmxTagName = (name: string): TMXTagName | undefined =>
  Object.values(TMXTagName).find((tagName) => tagName === name);
