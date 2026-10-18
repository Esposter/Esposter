import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A member of the deployed team used its Elemental Skill, as the skill starts: the member that used it
export interface KitSkillUsedEvent {
  characterId: number;
  kind: KitEventKind.SkillUsed;
}
