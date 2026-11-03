import type { CraftingBenchPlace } from "#src/models/crafting/CraftingBenchPlace";
import type { FishingPointPlace } from "#src/models/fishing/FishingPointPlace";
import type { HomeRealmVisit } from "#src/models/home/HomeRealmVisit";
import type { Interactable } from "#src/models/interaction/Interactable";
import type { FrostbearingTreePlace } from "#src/models/offering/FrostbearingTreePlace";
import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { Input } from "genshin-engine";
import type { Object3D } from "three";
import type { Ref } from "vue";

// What the world's prompts are offered from: the prompts each source of the world already holds, and the places and
// State of the rest, which the prompt list is joined from, and the body whose reach they are read in
export interface WorldInteractablesOptions {
  blacksmithPlace: Readonly<Ref<SceneGroupPlace | undefined>>;
  characterBody: Object3D;
  cookingStovePlace: Readonly<Ref<SceneGroupPlace | undefined>>;
  craftingBenchPlace: CraftingBenchPlace;
  domainArena: Readonly<Ref<undefined | { center: { x: number; z: number } }>>;
  fishingPointPlaces: Readonly<Ref<FishingPointPlace[]>>;
  frostbearingTreePlaces: readonly FrostbearingTreePlace[];
  homePotPoint: Readonly<Ref<undefined | { x: number; z: number }>>;
  homeRealmVisit: Readonly<Ref<HomeRealmVisit | undefined>>;
  input: Input;
  isDomainTreeRaised: Readonly<Ref<boolean>>;
  isFishingOpen: Readonly<Ref<boolean>>;
  outcropInteractables: Readonly<Ref<Interactable[]>>;
  residentInteractables: Readonly<Ref<Interactable[]>>;
  shrineInteractables: Readonly<Ref<Interactable[]>>;
  trounceBlossomInteractables: Readonly<Ref<Interactable[]>>;
  unlockedDomainEntrances: Readonly<Ref<DomainEntranceLandmark[]>>;
}
