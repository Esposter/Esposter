// The second level of a region, locked and with no Anemoculus held toward it, as the statue-worship reference shows it
import { WorshipLevelState } from "#src/models/WorshipLevelState";

export const props = {
  blessingTitle: "Sample Blessing",
  closeLabel: "Back",
  heldCount: 0,
  level: {
    level: 2,
    oculus: { count: 2, name: "Anemoculus" },
    rewards: [
      { count: 120, name: "Adventure EXP" },
      { count: 10, name: "Primogem" },
      { count: 5, name: "Anemo Sigil" },
    ],
    staminaShare: 7,
    state: WorshipLevelState.Locked,
  },
  levelLabel: "Lv.",
  requiredLabel: "Required",
  staminaLabel: "Stamina",
  title: "Worship Statue",
};
