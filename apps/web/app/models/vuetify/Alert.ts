import type { VAlert } from "vuetify/components";

export interface Alert extends Pick<VAlert["$props"], "icon" | "location" | "text" | "type"> {
  id: string;
}
