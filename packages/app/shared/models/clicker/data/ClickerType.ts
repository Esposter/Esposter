import type { Type } from "arktype";

import { type } from "arktype";

export enum ClickerType {
  Default = "Default",
  Magical = "Magical",
  Physical = "Physical",
}

export const clickerTypeSchema = type.valueOf(ClickerType) satisfies Type<ClickerType>;
