// What finishes a commission and counts toward it: enemies defeated, gadgets used, a challenge cleared, or nothing of its
// Own, as a quest task is finished by its quest
export const CommissionFinishKind = {
  Challenge: "Challenge",
  Gadget: "Gadget",
  Monster: "Monster",
  None: "None",
} as const;
export type CommissionFinishKind = (typeof CommissionFinishKind)[keyof typeof CommissionFinishKind];
