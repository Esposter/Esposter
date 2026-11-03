import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { Talk } from "#src/models/dialogue/Talk";
import type { HomeRealmToggleOptions } from "#src/models/home/HomeRealmToggleOptions";
import type { FrostbearingTreePlace } from "#src/models/offering/FrostbearingTreePlace";
import type { OfferingLevel } from "#src/models/offering/OfferingLevel";
import type { OfferingProgressSave } from "#src/models/offering/OfferingProgressSave";
import type { QuestRewardItem } from "#src/models/quest/QuestRewardItem";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { Resident } from "#src/models/world/Resident";
import type { Object3D } from "three";
import type { Ref } from "vue";

// What using a prompted interactable does, joined from the world's features: the places and state each kind of
// Interactable is looked up in, the screen it opens and what it opens that screen on, and the action each feature takes
// Its interactable by
export interface WorldInteractionDispatchOptions {
  characterBody: Object3D;
  checkIsFishingPoint: (id: string) => boolean;
  claimKatheryneBonus: () => void;
  cookingProgress: Readonly<Ref<CookingProgress>>;
  cookingRecipe: Ref<CookingRecipe | undefined>;
  cookingRecipes: Readonly<Ref<readonly CookingRecipe[]>>;
  drawReputationOffer: () => void;
  forgeNow: Ref<Temporal.Instant>;
  frostbearingTreeLevels: readonly OfferingLevel[];
  frostbearingTreePlaces: readonly FrostbearingTreePlace[];
  frostbearingTreeProgress: Readonly<Ref<OfferingProgressSave>>;
  getGameClockMinutes: () => number | undefined;
  getResidents: () => Resident[];
  getTalkDuelGameId: (talkId: string) => number | undefined;
  grantRewards: (rewards: QuestRewardItem[]) => void;
  offerFrostbearingTree: (frostbearingTreePlace: FrostbearingTreePlace) => void;
  openAbyssEntrance: () => void;
  openCookingRecipes: Ref<CookingRecipe[]>;
  openDomain: (landmark: DomainEntranceLandmark) => void;
  openDomainTreeClaim: (now: Temporal.Instant) => void;
  openFishingPoint: (id: string) => void;
  openOutcropClaim: (placeId: number, now: Temporal.Instant) => void;
  openShrineById: (shrineId: string) => void;
  openTrounceBlossomClaim: (spawnKey: string, now: Temporal.Instant) => void;
  random: () => number;
  reputationLevel: Ref<number>;
  shopId: Ref<number>;
  talk: Ref<Talk | undefined>;
  talkDuelGameId: Ref<number | undefined>;
  talkMap: Readonly<Ref<ReadonlyMap<string, Talk>>>;
  toggleHomeRealm: (options: HomeRealmToggleOptions) => void;
  trounceBlossoms: Readonly<Ref<ReadonlyMap<string, unknown>>>;
  unlockedDomainEntrances: Readonly<Ref<readonly DomainEntranceLandmark[]>>;
}
