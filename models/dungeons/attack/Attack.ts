import type { Animation } from "@/models/dungeons/animation/Animation";
import type { AttackId } from "@/models/dungeons/attack/AttackId";
import type { AttackName } from "@/models/dungeons/attack/AttackName";

export interface Attack {
  id: AttackId;
  name: AttackName;
  animation: Animation;
}
