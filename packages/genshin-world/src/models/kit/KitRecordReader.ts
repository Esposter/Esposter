import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitActionBehaviour } from "#src/models/kit/KitActionBehaviour";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitStanceActions } from "#src/models/kit/KitStanceActions";
import type { KitStanceBehaviour } from "#src/models/kit/KitStanceBehaviour";

// A kit's record as its behaviour reads it once, while its kit is built: the kit its slots build, whose actions and hits
// Are the built kit's own, and each value the record holds by name, resolved as the slots are, each read failing on a
// Name the record does not hold or holds in the other shape. A hit or an action read is a new one, given the behaviour
// Named, and a stance holds its kit's own actions where it plays them
export interface KitRecordReader {
  kit: Kit;
  readAction: (name: string, behaviour?: KitActionBehaviour) => KitAction;
  readActionFields: (name: string) => Partial<KitAction>;
  readActions: (name: string, behaviour?: KitActionBehaviour) => KitAction[];
  readArea: (name: string) => AttackArea;
  readAreas: (name: string) => AttackArea[];
  readHit: (name: string, behaviour?: KitHitBehaviour) => KitHit;
  readHitFields: (name: string) => Partial<KitHit>;
  readHits: (name: string, behaviour?: KitHitBehaviour) => KitHit[];
  readParameter: (name: string) => number;
  readParameters: (name: string) => number[];
  readSeconds: (name: string) => number;
  readSecondsList: (name: string) => number[];
  readStance: (name: string, behaviour?: KitStanceBehaviour) => KitStanceActions;
}
