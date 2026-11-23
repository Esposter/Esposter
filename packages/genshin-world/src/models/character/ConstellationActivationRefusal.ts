// Why a character's next constellation cannot be activated now: every constellation of its set is active already, or
// The Character holds no Stella Fortuna to spend on one
export const ConstellationActivationRefusal = { AllActive: "AllActive", NoStellaFortuna: "NoStellaFortuna" } as const;
export type ConstellationActivationRefusal =
  (typeof ConstellationActivationRefusal)[keyof typeof ConstellationActivationRefusal];
