import { type Asset } from "@/models/dungeons/Asset";
import { type Attack } from "@/models/dungeons/attack/Attack";
import { type Stats } from "@/models/dungeons/battle/monster/Stats";

export interface Monster {
  name: string;
  asset: Asset;
  stats: Stats;
  currentLevel: number;
  currentHp: number;
  attackIds: Attack["id"][];
}
