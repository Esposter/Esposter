import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

// Every piece of every set by its item id, each with the id of the set it is made of, so a bag entry names its set and slot
export const createReliquaryPieceEntryMap = (
  reliquarySets: readonly ReliquarySetData[],
): Map<number, ReliquaryPieceEntry> =>
  new Map(
    reliquarySets.flatMap(({ id, pieces }) =>
      pieces.map((piece): [number, ReliquaryPieceEntry] => [piece.itemId, { ...piece, setId: id }]),
    ),
  );
