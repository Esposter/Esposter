// The field member's figures the HUD's health and skill buttons show, read off the world each frame: the HP and level
// The health bar takes, and the cooldowns and energy the buttons count, each against its whole cooldown and cost
export interface HudMember {
  burstCooldown: number;
  burstCooldownSeconds: number;
  energy: number;
  energyCost: number;
  health: number;
  level: number;
  maxHealth: number;
  skillCooldown: number;
  skillCooldownSeconds: number;
}
