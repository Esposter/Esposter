import { type Asset } from "@/models/dungeons/Asset";
import { type CharacterId } from "@/models/dungeons/world/CharacterId";

export interface Character {
  id: `${CharacterId}${string}`;
  asset: Asset;
}
