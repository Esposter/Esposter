import type { Stats } from "@/models/dungeons/Stats";
import { AItemEntity } from "@/models/shared/AItemEntity";

export class Monster extends AItemEntity implements Stats {
  health = 6;
  attack = 3;
  armor = 1;

  constructor(init: Partial<Monster>) {
    super();
    Object.assign(this, init);
  }
}
