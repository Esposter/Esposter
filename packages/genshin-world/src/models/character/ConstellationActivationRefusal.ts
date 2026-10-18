// Why a character's next constellation cannot be activated now: every constellation of its set is active already, or the
// Character holds no Stella Fortuna to spend on one
export enum ConstellationActivationRefusal {
  AllActive = "AllActive",
  NoStellaFortuna = "NoStellaFortuna",
}
