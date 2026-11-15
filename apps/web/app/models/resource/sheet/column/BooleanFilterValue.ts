import { BooleanValue } from "#shared/models/resource/sheet/column/BooleanValue";
import { mergeObjectsStrict } from "@esposter/shared";

const BaseBooleanFilterValue = {
  // The "show only null cells" option, distinct from "" (no filter)
  Null: "null",
} as const;
type BaseBooleanFilterValue = (typeof BaseBooleanFilterValue)[keyof typeof BaseBooleanFilterValue];

export const BooleanFilterValue = mergeObjectsStrict(BooleanValue, BaseBooleanFilterValue);
export type BooleanFilterValue = "" | BaseBooleanFilterValue | BooleanValue;
