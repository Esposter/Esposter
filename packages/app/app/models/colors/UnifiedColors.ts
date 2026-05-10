import type { Colors as BaseVuetifyColors } from "vuetify/lib/composables/theme.mjs";

import type { BaseColors, getBaseColorsExtension } from "../../../vuetify.config";

export type UnifiedColors = BaseColors & BaseVuetifyColors & ReturnType<typeof getBaseColorsExtension>;
