import type { AbyssTowerBuff } from "#src/models/genshinAssets/spiralAbyss/AbyssTowerBuff";
import type { ExcelTowerBuffRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerBuffRow";

import { TowerBuffIconIconMap } from "#src/services/genshinAssets/spiralAbyss/TowerBuffIconIconMap";
import { TowerBuffLastingTypeScopeMap } from "#src/services/genshinAssets/spiralAbyss/TowerBuffLastingTypeScopeMap";

// Each Benediction of the tower buff table by its id, holding its description's text hash, and the glyph and span its row
// Names where the published record holds one. A Benediction with no glyph or no span has no such field, rather than one
// Written as undefined
export const toAbyssTowerBuffs = (rows: ExcelTowerBuffRow[]): Map<number, AbyssTowerBuff> =>
  new Map(
    rows.map(({ buffIcon, descTextMapHash, lastingType, towerBuffId }): [number, AbyssTowerBuff] => {
      const icon = TowerBuffIconIconMap[buffIcon];
      const scope = TowerBuffLastingTypeScopeMap[lastingType];
      return [
        towerBuffId,
        {
          descriptionTextHash: descTextMapHash,
          ...(icon === undefined ? {} : { icon }),
          ...(scope === undefined ? {} : { scope }),
        },
      ];
    }),
  );
