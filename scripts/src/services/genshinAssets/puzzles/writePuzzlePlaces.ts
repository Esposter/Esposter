import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { placeMapPoints } from "#src/services/genshinAssets/points/placeMapPoints";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { writeMapPointSlices } from "#src/services/genshinAssets/points/writeMapPointSlices";
import { PUZZLE_PLACES_GENERATED_DIRECTORY } from "#src/services/genshinAssets/puzzles/constants";
import { PuzzleKindLabelIdsMap } from "#src/services/genshinAssets/puzzles/PuzzleKindLabelIdsMap";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { PuzzleKind } from "genshin-world";

// Each region's puzzle mechanisms written as one slice in the world's generated folder, from the official map's points and
// The fit. The report counts each region's places and what was left out
export const writePuzzlePlaces = async (): Promise<string> => {
  const [origin, { points, transform }] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFittedMapPoints(),
  ]);
  const labelIdKindMap = new Map(
    Object.values(PuzzleKind).flatMap((kind) => PuzzleKindLabelIdsMap[kind].map((labelId) => [labelId, kind] as const)),
  );
  const placement = placeMapPoints(points, transform, labelIdKindMap, "puzzle", origin);
  return writeMapPointSlices(PUZZLE_PLACES_GENERATED_DIRECTORY, placement, "puzzles");
};
