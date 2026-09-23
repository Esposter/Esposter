// @unocss-include
import type { VAlert } from "vuetify/components";

export const AlertIconMap = {
  error: "i-mdi:cancel",
  info: "i-mdi:alert-circle",
  success: "i-mdi:check-circle",
  warning: "i-mdi:alert",
} as const satisfies Record<NonNullable<VAlert["$props"]["type"]>, string>;
