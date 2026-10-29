import type { AbyssTowerBuff } from "#src/models/genshinAssets/spiralAbyss/AbyssTowerBuff";
import type { ExcelTowerBuffRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerBuffRow";

import { TOWER_BUFF_TEXT_HASH_OFFSET } from "#src/services/genshinAssets/spiralAbyss/constants";
import { TowerBuffIconIconMap } from "#src/services/genshinAssets/spiralAbyss/TowerBuffIconIconMap";
import { TowerBuffLastingTypeScopeMap } from "#src/services/genshinAssets/spiralAbyss/TowerBuffLastingTypeScopeMap";

// Each Benediction of the tower buff table by its id, holding its description under the text map key its hash is offset
// To, and the glyph and span its row names where the published record holds one. A Benediction with no glyph or no span
// Has no such field, rather than one written as undefined
export const toAbyssTowerBuffs = (rows: ExcelTowerBuffRow[]): Map<number, AbyssTowerBuff> =>
  new Map(
    rows.map(({ buffIcon, descTextMapHash, lastingType, towerBuffId }): [number, AbyssTowerBuff] => {
      const icon = TowerBuffIconIconMap[buffIcon];
      const scope = TowerBuffLastingTypeScopeMap[lastingType];
      return [
        towerBuffId,
        {
          descriptionTextHash: descTextMapHash + TOWER_BUFF_TEXT_HASH_OFFSET,
          ...(icon === undefined ? {} : { icon }),
          ...(scope === undefined ? {} : { scope }),
        },
      ];
    }),
  );
