import type { PropKind } from "#src/models/genshinAssets/props/PropKind";
import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { PropShape } from "#src/models/genshinAssets/props/PropShape";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { fitLatheProfile } from "#src/services/genshinAssets/fit/fitLatheProfile";
import { fitVisualHull } from "#src/services/genshinAssets/fit/fitVisualHull";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { buildPropRecord } from "#src/services/genshinAssets/props/buildPropRecord";
import { HULL_CELL_SIZE } from "#src/services/genshinAssets/shared/constants";
import { readObjMesh } from "#src/services/genshinAssets/shared/readObjMesh";
import { toRightHanded } from "#src/services/genshinAssets/shared/toRightHanded";
import { existsSync } from "node:fs";
import { join } from "node:path";

// A prop kind's outline fitted from its mesh under the props' assets: the visual hull of a solid kind or the lathe of a
// Round one, in three's axes as the rocks' hulls are. A mesh that is not on disk is named and skipped, so the kinds beside
// It still fit and no record is written for it
export const fitPropKind = async (kind: PropKind, assets: string): Promise<GameDataBuild> => {
  const path = join(assets, AssetType.Mesh, `${kind.mesh}.obj`);
  if (!existsSync(path))
    return { notes: [`${kind.name}: export ${kind.mesh}.obj is not on disk, skipped`], objects: {} };
  const { faces, vertices } = await readObjMesh(path);
  const local = vertices.map((vertex) => toRightHanded(vertex));
  if (kind.shape === PropShape.Hull) {
    const boxes = fitVisualHull({ faces, vertices: local }, HULL_CELL_SIZE).map((box) =>
      box.map((value) => roundFitted(value)),
    );
    return {
      ...buildPropRecord(kind, { boxes, shape: PropShape.Hull }),
      notes: [`${kind.name}: ${boxes.length} boxes`],
    };
  }
  const { axis, foot, sections } = fitLatheProfile(local, { bandHeight: kind.bandHeight, tolerance: kind.tolerance });
  const fitted = {
    axis: axis.map((value) => roundFitted(value)),
    foot: roundFitted(foot),
    sections: sections.map(({ bottomRadius, height, topRadius }) => ({
      bottomRadius: roundFitted(bottomRadius),
      height: roundFitted(height),
      topRadius: roundFitted(topRadius),
    })),
    shape: PropShape.Lathe,
  };
  return { ...buildPropRecord(kind, fitted), notes: [`${kind.name}: ${sections.length} sections`] };
};
