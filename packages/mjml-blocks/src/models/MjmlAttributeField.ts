import type { MjmlAttributeType } from "#src/models/MjmlAttributeType";

// The editor's descriptor of one attribute: its control's type and MJML's default, if it has one
export interface MjmlAttributeField {
  defaultValue: string | undefined;
  name: string;
  type: MjmlAttributeType;
}
