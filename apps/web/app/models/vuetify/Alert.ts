import type { VAlert } from "vuetify/components";

export interface Alert extends Pick<VAlert["$props"], "icon" | "text"> {
  id: string;
  type: NonNullable<VAlert["$props"]["type"]>;
}
