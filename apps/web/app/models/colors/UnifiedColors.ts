import type { BaseColors, getBaseColorsExtension } from "@@/vuetify.config";
import type { Colors as BaseVuetifyColors } from "vuetify/lib/composables/theme.mjs";

export type UnifiedColors = BaseColors & BaseVuetifyColors & ReturnType<typeof getBaseColorsExtension>;
