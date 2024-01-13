import { type Asset } from "@/models/dungeons/Asset";
import { type Stats } from "@/models/dungeons/Stats";

export interface Monster {
  name: string;
  asset: Asset;
  stats: Stats;
  currentHp: number;
  attackIds: string[];
}
