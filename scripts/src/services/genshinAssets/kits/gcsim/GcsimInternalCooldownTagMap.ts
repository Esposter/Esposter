import { InternalCooldownTag } from "genshin-world";

// The ICD tags gcsim names in an `AttackInfo` literal, as the kit names the ones it holds. `ICDTagNone` is a hit
// With no tag, and a tag the kit does not name is kept by its gcsim name, which no kit value equals
export const GcsimInternalCooldownTagMap: Partial<Record<string, InternalCooldownTag>> = {
  "attacks.ICDTagElementalArt": InternalCooldownTag.ElementalSkill,
  "attacks.ICDTagElementalBurst": InternalCooldownTag.ElementalBurst,
  "attacks.ICDTagExtraAttack": InternalCooldownTag.ChargedAttack,
  "attacks.ICDTagFurinaChevalmarin": InternalCooldownTag.FurinaChevalmarin,
  "attacks.ICDTagFurinaUsher": InternalCooldownTag.FurinaUsher,
  "attacks.ICDTagKleeFireDamage": InternalCooldownTag.KleePyroDamage,
  "attacks.ICDTagLisaElectro": InternalCooldownTag.LisaElectroDamage,
  "attacks.ICDTagMonaWaterDamage": InternalCooldownTag.MonaHydroDamage,
  "attacks.ICDTagNormalAttack": InternalCooldownTag.NormalAttack,
  "attacks.ICDTagTartagliaRiptideFlash": InternalCooldownTag.TartagliaRiptide,
};
