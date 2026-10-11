import type { Element } from "#src/models/Element";
import type { SkillGlyphs } from "#src/models/hud/SkillGlyphs";
import type { WeaponType } from "#src/models/weapon/WeaponType";

// The field member's figures the HUD's health and skill buttons show, read off the world each frame: the HP and level
// The health bar takes, the cooldowns and energy the buttons count, each against its whole cooldown and cost, and the
// Icons they carry, and the kind of weapon it wields, whose glyph the touch layout's attack button carries, none for a
// Character the roster's table does not hold
export interface HudMember {
  burstCooldown: number;
  burstCooldownSeconds: number;
  // The element its burst's button is coloured in, none for a character the roster's table gives none
  element?: Element;
  energy: number;
  energyCost: number;
  health: number;
  level: number;
  maxHealth: number;
  skillCooldown: number;
  skillCooldownSeconds: number;
  // The icons its skill and burst buttons carry, none for a character whose icons are not traced
  skillGlyphs?: SkillGlyphs;
  weaponType?: WeaponType;
}
