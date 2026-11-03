import type { Interactable } from "#src/models/interaction/Interactable";
import type { WorldInteractionDispatchOptions } from "#src/models/interaction/WorldInteractionDispatchOptions";

import { ScreenKind } from "#src/models/screen/ScreenKind";
import { getViewpointInteractableId } from "#src/services/archive/getViewpointInteractableId";
import { COOKING_PROCESSING_INTERACTABLE_ID, COOKING_STOVE_INTERACTABLE_ID } from "#src/services/cooking/constants";
import { listOpenCookingRecipes } from "#src/services/cooking/listOpenCookingRecipes";
import { getTalkScreenKind } from "#src/services/dialogue/getTalkScreenKind";
import { getTalkVendorShopId } from "#src/services/dialogue/getTalkVendorShopId";
import { DOMAIN_LEAVE_INTERACTABLE_ID, DOMAIN_TREE_INTERACTABLE_ID } from "#src/services/domains/constants";
import { checkIsExpeditionTalk } from "#src/services/expedition/checkIsExpeditionTalk";
import { FORGE_INTERACTABLE_ID } from "#src/services/forging/constants";
import { HOME_POT_GADGET_ID, HOME_TUBBY_NPC_ID } from "#src/services/home/constants";
import { checkIsVendorHourOpen } from "#src/services/shop/checkIsVendorHourOpen";
import { checkIsVendorShopOpen } from "#src/services/shop/checkIsVendorShopOpen";
import { VendorShopTypeMap } from "#src/services/shop/VendorShopTypeMap";
import { ABYSS_ENTRANCE_INTERACTABLE_ID } from "#src/services/spiralAbyss/constants";
import { getStatueRegionId } from "#src/services/statue/getStatueRegionId";
import { useWorldAdventureRankStore } from "#src/store/adventureRank";
import { useWorldArchiveStore } from "#src/store/archive";
import { useWorldGroundStore } from "#src/store/ground";
import { useWorldMapStore } from "#src/store/map";
import { useWorldPickupsStore } from "#src/store/pickups";
import { useWorldReputationStore } from "#src/store/reputation";
import { useWorldScreenStore } from "#src/store/screen";
import { useWorldSessionStore } from "#src/store/session";
import { InteractionKind } from "genshin-interface";
import { storeToRefs } from "pinia";

// What using the interactable the player is prompted on does: the open world's pickups, chests, claims and landmarks run
// Their feature's action, and a stove, a forge, a domain, the Abyss, a shop, a fishing point or a talk opens its screen.
// The branches are tried in order, so a kind's more specific cases come before its general one
export const useWorldInteractionDispatch = ({
  characterBody,
  checkIsFishingPoint,
  claimKatheryneBonus,
  cookingProgress,
  cookingRecipe,
  cookingRecipes,
  digChestById,
  drawReputationOffer,
  forgeNow,
  frostbearingTreeLevels,
  frostbearingTreePlaces,
  frostbearingTreeProgress,
  getGameClockMinutes,
  getResidents,
  getTalkDuelGameId,
  grantRewards,
  offerFrostbearingTree,
  openAbyssEntrance,
  openChestById,
  openCookingRecipes,
  openDomain,
  openDomainTreeClaim,
  openFishingPoint,
  openOutcropClaim,
  openShrineById,
  openTrounceBlossomClaim,
  openWorship,
  random,
  reputationLevel,
  resonateStatue,
  shopId,
  shrineMarkers,
  talk,
  talkDuelGameId,
  talkMap,
  toggleHomeRealm,
  trounceBlossoms,
  unlockedDomainEntrances,
}: WorldInteractionDispatchOptions) => {
  const worldGroundStore = useWorldGroundStore();
  const { getGroundHeight } = worldGroundStore;
  const worldScreenStore = useWorldScreenStore();
  const { screenKind } = storeToRefs(worldScreenStore);
  const worldPickupsStore = useWorldPickupsStore();
  const { materialSources, worldDrops } = storeToRefs(worldPickupsStore);
  const { pickUpGatheringPlace, pickUpMaterialSourcePlace, pickUpWorldDrop } = worldPickupsStore;
  const worldArchiveStore = useWorldArchiveStore();
  const { offeredViewpoints } = storeToRefs(worldArchiveStore);
  const { viewViewpoint } = worldArchiveStore;
  const worldReputationStore = useWorldReputationStore();
  const { reputation } = storeToRefs(worldReputationStore);
  const worldMapStore = useWorldMapStore();
  const { unlockedLandmarkIds } = storeToRefs(worldMapStore);
  const { activateLandmark, jumpTo } = worldMapStore;
  const worldAdventureRankStore = useWorldAdventureRankStore();
  const { claimKatheryneRewards } = worldAdventureRankStore;
  const worldSessionStore = useWorldSessionStore();
  const { getWorldNow } = worldSessionStore;
  // A talk opens the screen its resident's talk is, and Katheryne's opens the expedition screen in place of the talk once
  // She stands in the world
  const openTalk = (talkId: string) => {
    talk.value = talkMap.value.get(talkId);
    talkDuelGameId.value = getTalkDuelGameId(talkId);
    screenKind.value = getTalkScreenKind(talkId, getResidents());
    if (checkIsExpeditionTalk(talkId, getResidents())) {
      grantRewards(claimKatheryneRewards());
      claimKatheryneBonus();
      screenKind.value = ScreenKind.Expedition;
    }
    shopId.value = getTalkVendorShopId(talkId, getResidents()) ?? 0;
    // A Souvenir Shop stays closed until its region's offering is at its last level, a day vendor's outside their hours,
    // And no shop opens before the world's clock is read, so its talk is a dialogue until then
    const gameClockMinutes = getGameClockMinutes();
    if (
      screenKind.value === ScreenKind.Shop &&
      (!checkIsVendorShopOpen(shopId.value, frostbearingTreeProgress.value.level, frostbearingTreeLevels) ||
        gameClockMinutes === undefined ||
        !checkIsVendorHourOpen(shopId.value, gameClockMinutes))
    )
      screenKind.value = ScreenKind.Dialogue;
    reputationLevel.value = reputation.value.level;
    if (screenKind.value === ScreenKind.Reputation) drawReputationOffer();
  };
  const dispatchInteraction = (interactable: Interactable | undefined) => {
    const worldDrop = worldDrops.value.find(({ id }) => id === interactable?.id);
    const materialSource = materialSources.value.find(({ id }) => id === interactable?.id);
    const frostbearingTreePlace = frostbearingTreePlaces.find(({ id }) => id === interactable?.id);
    const offeredViewpoint = offeredViewpoints.value.find(
      ({ id }) => getViewpointInteractableId(id) === interactable?.id,
    );
    const domainEntranceLandmark = unlockedDomainEntrances.value.find(({ id }) => id === interactable?.id);
    if (interactable?.kind === InteractionKind.PickUp && worldDrop) pickUpWorldDrop(worldDrop);
    else if (interactable?.kind === InteractionKind.PickUp && materialSource)
      pickUpMaterialSourcePlace(materialSource.id);
    else if (interactable?.kind === InteractionKind.PickUp) pickUpGatheringPlace(interactable.id);
    else if (interactable?.kind === InteractionKind.Open && shrineMarkers.some(({ id }) => id === interactable.id))
      openShrineById(interactable.id);
    else if (interactable?.kind === InteractionKind.Open) openChestById(interactable.id, random);
    else if (interactable?.kind === InteractionKind.Claim && trounceBlossoms.value.has(interactable.id))
      openTrounceBlossomClaim(interactable.id, getWorldNow());
    else if (interactable?.kind === InteractionKind.Claim) openOutcropClaim(Number(interactable.id), getWorldNow());
    else if (interactable?.kind === InteractionKind.Dig) digChestById(interactable.id);
    else if (interactable?.kind === InteractionKind.Activate && frostbearingTreePlace)
      offerFrostbearingTree(frostbearingTreePlace);
    else if (interactable?.kind === InteractionKind.Activate && offeredViewpoint) viewViewpoint(offeredViewpoint.id);
    else if (interactable?.kind === InteractionKind.Activate && interactable.id === COOKING_STOVE_INTERACTABLE_ID) {
      openCookingRecipes.value = listOpenCookingRecipes(cookingRecipes.value, cookingProgress.value);
      cookingRecipe.value = openCookingRecipes.value[0];
      if (cookingRecipe.value) screenKind.value = ScreenKind.Cooking;
    } else if (
      interactable?.kind === InteractionKind.Activate &&
      interactable.id === COOKING_PROCESSING_INTERACTABLE_ID
    )
      screenKind.value = ScreenKind.Processing;
    else if (
      interactable?.kind === InteractionKind.Activate &&
      unlockedLandmarkIds.value.has(interactable.id) &&
      getStatueRegionId(interactable.id) !== undefined
    )
      openWorship(interactable.id);
    else if (interactable?.kind === InteractionKind.Activate && interactable.id === DOMAIN_LEAVE_INTERACTABLE_ID)
      screenKind.value = ScreenKind.Domain;
    else if (interactable?.kind === InteractionKind.Activate && interactable.id === DOMAIN_TREE_INTERACTABLE_ID)
      openDomainTreeClaim(getWorldNow());
    else if (interactable?.kind === InteractionKind.Activate && domainEntranceLandmark) {
      openDomain(domainEntranceLandmark);
      screenKind.value = ScreenKind.Domain;
    } else if (interactable?.kind === InteractionKind.Activate && interactable.id === ABYSS_ENTRANCE_INTERACTABLE_ID) {
      openAbyssEntrance();
      screenKind.value = ScreenKind.SpiralAbyss;
    } else if (interactable?.kind === InteractionKind.Activate && interactable.id === String(HOME_POT_GADGET_ID))
      toggleHomeRealm({
        getGroundHeight,
        jumpTo,
        standing: { position: characterBody.position, yaw: characterBody.rotation.y },
      });
    else if (interactable?.kind === InteractionKind.Talk && interactable.id === String(HOME_TUBBY_NPC_ID)) {
      shopId.value = VendorShopTypeMap[String(HOME_TUBBY_NPC_ID)] ?? 0;
      reputationLevel.value = reputation.value.level;
      screenKind.value = ScreenKind.Shop;
    } else if (interactable?.kind === InteractionKind.Activate) {
      activateLandmark(interactable.id);
      resonateStatue(interactable.id);
    } else if (interactable?.kind === InteractionKind.Use && checkIsFishingPoint(interactable.id)) {
      openFishingPoint(interactable.id);
      screenKind.value = ScreenKind.Fishing;
    } else if (interactable?.id === FORGE_INTERACTABLE_ID) {
      forgeNow.value = getWorldNow();
      screenKind.value = ScreenKind.Forge;
    } else if (interactable?.kind === InteractionKind.Use) screenKind.value = ScreenKind.Crafting;
    else if (interactable?.kind === InteractionKind.Talk) openTalk(interactable.id);
  };
  return { dispatchInteraction };
};
