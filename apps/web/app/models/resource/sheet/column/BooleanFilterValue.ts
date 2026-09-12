import { BooleanValue } from "@/models/resource/sheet/column/BooleanValue";
import { mergeObjectsStrict } from "@esposter/shared";

enum BaseBooleanFilterValue {
  // The "show only null cells" option, distinct from "" (no filter)
  Null = "null",
}

export const BooleanFilterValue = mergeObjectsStrict(BooleanValue, BaseBooleanFilterValue);
export type BooleanFilterValue = "" | BaseBooleanFilterValue | BooleanValue;
