import type { GadgetRow } from "#src/models/gadget/GadgetRow";
import type { HudFrame } from "#src/models/hud/HudFrame";
import type { Interactable } from "#src/models/interaction/Interactable";
import type { InteractionPrompts } from "#src/models/interaction/InteractionPrompts";
import type { KitContext } from "#src/models/kit/KitContext";
import type { OculusPlace } from "#src/models/oculus/OculusPlace";
import type { Party } from "#src/models/party/Party";
import type { ElementalSight } from "#src/models/sight/ElementalSight";
import type { WorldChallengeStep } from "#src/models/world/WorldChallengeStep";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { Input, InputState } from "genshin-engine";
import type { Object3D } from "three";
import type { Ref } from "vue";

// What the world's frame steps are joined from: the input read for it, the screen it is on, the state and the step of
// Each feature that moves on its own, and the body and the party they act on
export interface WorldFrameOptions {
  abyssChoices: Readonly<Ref<unknown>>;
  characterBody: Object3D;
  checkIsPaused: () => boolean;
  closeShortcutWheel: () => void;
  collectOculus: (regionId: string, source: OculusPlace) => void;
  dispatchInteraction: (interactable: Interactable | undefined) => void;
  domainClaimOffers: Readonly<Ref<unknown>>;
  drawDayOutcrops: (now: Temporal.Instant, random: () => number) => void;
  elementalSight: ElementalSight;
  findTouchedOculus: () => OculusPlace | undefined;
  getEquippedGadgetCooldown: (now: Temporal.Instant) => number;
  getMemberMaxHealth: (characterId: number) => number | undefined;
  hudFrame: HudFrame;
  input: Input;
  inputState: InputState;
  interactionPrompts: Readonly<Ref<InteractionPrompts>>;
  isHudHidden: Ref<boolean>;
  kitContext: KitContext;
  party: Party;
  placeUsedGadget: (usedGadget: GadgetRow | undefined, feet: { x: number; z: number }) => void;
  readInteraction: (inputState: InputState, frameSeconds: number) => Interactable | undefined;
  refreshMiningOutcrops: (now: Temporal.Instant, random: () => number) => void;
  showCursor: () => void;
  stepAbyss: (step: WorldChallengeStep) => void;
  stepAutoRecover: (step: {
    deltaMilliseconds: number;
    getMaxHealth: (characterId: number) => number | undefined;
    isNearStatue: boolean;
    party: Party;
  }) => void;
  stepDomainChallenge: (step: WorldChallengeStep) => string[];
  stepFishing: (step: { isReeling: boolean; isStruck: boolean; seconds: number }) => void;
  stepMenuNavigation: (deltaSeconds: number) => void;
  stepQuickUse: (step: {
    isActive: boolean;
    isHeld: boolean;
    now: Temporal.Instant;
    seconds: number;
  }) => GadgetRow | undefined;
  stepShortcutWheel: (isHeld: boolean, x: number, y: number) => void;
  stepTrial: (step: WorldChallengeStep) => undefined | WorldJumpPose;
  touchOutcropsNear: (x: number, z: number, random: () => number) => void;
}
