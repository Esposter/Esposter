import { type Row } from "@/models/user/ProfileCard/Row";

export interface EditedRow extends Row {
  editedValue: Row["value"];
}
