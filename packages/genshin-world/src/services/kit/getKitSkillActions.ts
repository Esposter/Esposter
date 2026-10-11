import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";

// Every action a kit's skill plays: its press, the follow-ups of its chain, and each hold level's action with its
// Variant's
export const getKitSkillActions = (kit: Kit): KitAction[] => [
  kit.elementalSkill,
  ...(kit.elementalSkillChain?.followUps ?? []),
  ...(kit.elementalSkillHolds ?? []).flatMap(({ action, variant }) => (variant ? [action, variant.action] : [action])),
];
