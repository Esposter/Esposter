import type { MjmlAttributeType } from "mjml-blocks";

// One style field of an email node: the control its attribute's type draws, the value the node sets, and the value the
// Cascade gives it. A field the node does not set shows the cascade's value, and clearing it restores that value
export interface EmailStyleField {
  isSet: boolean;
  name: string;
  placeholder: string;
  type: MjmlAttributeType;
  value: string;
}
