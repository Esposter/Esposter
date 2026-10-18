import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { Landmark } from "#src/models/world/Landmark";

import { DomainKind } from "#src/models/domains/DomainKind";
import { LandmarkKind } from "#src/models/world/LandmarkKind";

// Whether a landmark is a weekly boss's Trounce Domain entrance, which opens by its introducing quests and takes no resonance
export const checkIsWeeklyBossEntrance = (landmark: Landmark): landmark is DomainEntranceLandmark =>
  landmark.kind === LandmarkKind.DomainEntrance && landmark.domainKind === DomainKind.Trounce;
