import type { Stats } from "@/models/dungeons/Stats";
import { AItemEntity } from "@/models/shared/AItemEntity";

export class Player extends AItemEntity implements Stats {
  health = 10;
  attack = 3;
  armor = 2;
}
