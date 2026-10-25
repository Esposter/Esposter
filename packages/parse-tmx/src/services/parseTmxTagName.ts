import { TMXTagName } from "#src/models/tmx/TMXTagName";

export const parseTmxTagName = (name: string): TMXTagName | undefined =>
  Object.values(TMXTagName).find((tagName) => tagName === name);
