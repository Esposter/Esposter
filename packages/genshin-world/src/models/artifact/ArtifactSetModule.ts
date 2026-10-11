import type { Kit } from "#src/models/kit/Kit";

// What a set's bonus that waits on combat does once its wearer wears enough of the set, as a kit's passive does: the
// Attributes it adds to its wearer's pricing at the HP it stands at, and the events of combat it answers, each read as
// Its wearer's own kit reads them
export type ArtifactSetModule = Pick<Kit, "getPassiveBonuses" | "onKitEvent">;
