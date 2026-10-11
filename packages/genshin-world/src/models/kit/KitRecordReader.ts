import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitStanceActions } from "#src/models/kit/KitStanceActions";
import type { KitStanceBehaviour } from "#src/models/kit/KitStanceBehaviour";
import type { Except, RequiredKeysOf } from "type-fest";

// A kit's record as its behaviour reads it once, while its kit is built: the kit its slots build, whose actions and hits
// Are the built kit's own, and each value the record holds by name, resolved as the slots are, each read failing on a
// Name the record does not hold or holds in the other shape. A hit or an action read is a new one, given the behaviour
// Named, a hit's fields are read short of exactly the fields every hit holds that the behaviour gives, and a stance holds
// Its kit's own actions where it plays them
export interface KitRecordReader {
  kit: Kit;
  readAction: (name: string, behaviour?: KitActionBehaviour) => KitAction;
  readActions: (name: string, behaviour?: KitActionBehaviour) => KitAction[];
  readArea: (name: string) => AttackArea;
  readAreas: (name: string) => AttackArea[];
  // A count of frames as the record holds it, for a schedule its kit counts in whole frames as it plays, as gcsim counts
  // It, each sum converted by `toKitSeconds`
  readFrames: (name: string) => number;
  readFramesList: (name: string) => number[];
  readHit: (name: string, behaviour?: KitHitBehaviour) => KitHit;
  readHitFields: <K extends RequiredKeysOf<KitHit>>(name: string, shortFields: readonly K[]) => Except<KitHit, K>;
  readHits: (name: string, behaviour?: KitHitBehaviour) => KitHit[];
  readParameter: (name: string) => number;
  readParameters: (name: string) => number[];
  readSeconds: (name: string) => number;
  readSecondsList: (name: string) => number[];
  readStance: (name: string, behaviour?: KitStanceBehaviour) => KitStanceActions;
}
