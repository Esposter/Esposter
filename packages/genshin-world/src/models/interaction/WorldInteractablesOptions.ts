import type { ArchiveData } from "#src/models/archive/ArchiveData";
import type { ArchiveViewpoint } from "#src/models/archive/ArchiveViewpoint";
import type { CraftingBenchPlace } from "#src/models/crafting/CraftingBenchPlace";
import type { FishingPointPlace } from "#src/models/fishing/FishingPointPlace";
import type { HomeRealmVisit } from "#src/models/home/HomeRealmVisit";
import type { Interactable } from "#src/models/interaction/Interactable";
import type { FrostbearingTreePlace } from "#src/models/offering/FrostbearingTreePlace";
import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { Landmark } from "#src/models/world/Landmark";
import type { Input } from "genshin-engine";
import type { Object3D } from "three";
import type { Ref } from "vue";

// What the world's prompts are offered from: the prompts each source of the world already holds, and the places and
// State of the rest, which the prompt list is joined from, and the body whose reach they are read in
export interface WorldInteractablesOptions {
  archiveData: Readonly<Ref<ArchiveData | undefined>>;
  blacksmithPlace: Readonly<Ref<SceneGroupPlace | undefined>>;
  characterBody: Object3D;
  chestInteractables: Readonly<Ref<Interactable[]>>;
  cookingStovePlace: Readonly<Ref<SceneGroupPlace | undefined>>;
  craftingBenchPlace: CraftingBenchPlace;
  domainArena: Readonly<Ref<undefined | { center: { x: number; z: number } }>>;
  fishingPointPlaces: Readonly<Ref<FishingPointPlace[]>>;
  frostbearingTreePlaces: readonly FrostbearingTreePlace[];
  getGroundHeight: (x: number, z: number) => number;
  homePotPoint: Readonly<Ref<undefined | { x: number; z: number }>>;
  homeRealmVisit: Readonly<Ref<HomeRealmVisit | undefined>>;
  input: Input;
  isDomainTreeRaised: Readonly<Ref<boolean>>;
  isFishingOpen: Readonly<Ref<boolean>>;
  lockedJumpLandmarks: Readonly<Ref<Landmark[]>>;
  offeredViewpoints: Readonly<Ref<readonly ArchiveViewpoint[]>>;
  outcropInteractables: Readonly<Ref<Interactable[]>>;
  pickUpInteractables: Readonly<Ref<Interactable[]>>;
  residentInteractables: Readonly<Ref<Interactable[]>>;
  shrineInteractables: Readonly<Ref<Interactable[]>>;
  trounceBlossomInteractables: Readonly<Ref<Interactable[]>>;
  unlockedDomainEntrances: Readonly<Ref<DomainEntranceLandmark[]>>;
  unlockedLandmarks: Readonly<Ref<Landmark[]>>;
  viewpointPlaceMap: Readonly<Ref<ReadonlyMap<number, SceneGroupPlace>>>;
}
