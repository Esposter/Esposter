import { UiKeyLabelMap } from "@/services/ui/UiKeyLabelMap";
import { capitalize } from "@esposter/shared";

// A shortcut in Vuetify's hotkey syntax as the key caps it is pressed with: each step of a sequence, and the keys held
// Together in each step
export const getShortcutKeyLabels = (shortcut: string) =>
  shortcut.split("-").map((chord) => chord.split("+").map((key) => UiKeyLabelMap[key] ?? capitalize(key)));
