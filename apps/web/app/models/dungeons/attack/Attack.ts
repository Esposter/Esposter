import type { DungeonsKey } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import type { AttackId } from "#shared/models/dungeons/attack/AttackId";

export interface Attack {
  fileKey: DungeonsKey;
  id: AttackId;
  power: number;
}
