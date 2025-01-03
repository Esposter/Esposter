import type { RowValueType } from "@/models/user/ProfileCard/RowValueType";

export interface Row<TValue> {
  type: RowValueType;
  value: TValue;
}
