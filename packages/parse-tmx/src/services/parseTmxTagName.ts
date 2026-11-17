import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { checkIsEnumValue } from "@esposter/shared";

export const parseTmxTagName = (name: string): TMXTagName | undefined =>
  checkIsEnumValue(TMXTagName, name) ? name : undefined;
