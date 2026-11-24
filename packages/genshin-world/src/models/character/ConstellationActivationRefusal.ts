// Why a character's next constellation cannot be activated now.
// Every constellation of its set is active already, or the character holds no Stella Fortuna to spend on one.
export const ConstellationActivationRefusal = { AllActive: "AllActive", NoStellaFortuna: "NoStellaFortuna" } as const;
export type ConstellationActivationRefusal =
  (typeof ConstellationActivationRefusal)[keyof typeof ConstellationActivationRefusal];
