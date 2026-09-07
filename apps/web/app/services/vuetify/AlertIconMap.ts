import type { VAlert } from "vuetify/components";

export const AlertIconMap = {
  error: "mdi-cancel",
  info: "mdi-alert-circle",
  success: "mdi-check-circle",
  warning: "mdi-alert",
} as const satisfies Record<NonNullable<VAlert["$props"]["type"]>, string>;
