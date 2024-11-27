import type { RowValueType } from "@/models/user/ProfileCard/RowValueType";

export interface Row {
  type: RowValueType;
  value: null | string;
}
