import type { RowValueType } from "@/models/user/ProfileCard/RowValueType";

export interface Row<TType extends RowValueType> {
  type: TType;
  value: null | string | undefined;
}
