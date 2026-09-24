import type { ArrowKeyDefinition } from "@/models/resource/sheet/ArrowKeyDefinition";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

export const ArrowKeyDefinitionMap = {
  ArrowDown: { delta: [1, 0], direction: "down", meaning: UiIconMeaning.ArrowDown },
  ArrowLeft: { delta: [0, -1], direction: "left", meaning: UiIconMeaning.ArrowLeft },
  ArrowRight: { delta: [0, 1], direction: "right", meaning: UiIconMeaning.ArrowRight },
  ArrowUp: { delta: [-1, 0], direction: "up", meaning: UiIconMeaning.ArrowUp },
} as const satisfies Record<string, ArrowKeyDefinition>;
