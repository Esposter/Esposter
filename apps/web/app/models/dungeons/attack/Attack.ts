import type { FileKey } from "#shared/generated/phaser/FileKey";
import type { AttackId } from "#shared/models/dungeons/attack/AttackId";

export interface Attack {
  fileKey: FileKey;
  id: AttackId;
  power: number;
}
