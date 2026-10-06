import { LoginStage } from "#src/models/login/LoginStage";
import { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";
import { LoginPartFamilyMeshRegexMap } from "#src/services/login/LoginPartFamilyMeshRegexMap";
import { QualityTier } from "genshin-engine";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";

// The night sky at the title's pose, the English recording's, which the scene is first matched under, judged by
// `compare`'s shape and tone against its references
export const props = {
  gameText: ENGLISH_GAME_TEXT,
  language: GameLanguage.English,
  progress: 0,
  stage: LoginStage.Title,
  timeOfDay: LoginTimeOfDay.Night,
};
export const readyEvent = "ready";
// The visual suite holds the scene still to approve it: its glide held at the loop's start, drawn at the middle
// Tier, whose anti-aliasing does not jitter as the highest tier's does, with no interface over it, so a light or
// A part that changes how the scene looks shows as an image that moved, which a frame's mean score can hide
export const stillProps = { heldScrolled: 0, isInterfaceHidden: true, qualityTier: QualityTier.Medium };
// Every hour, night being the fixture's own
export const variants = {
  dawn: { timeOfDay: LoginTimeOfDay.Dawn },
  day: { timeOfDay: LoginTimeOfDay.Day },
  dusk: { timeOfDay: LoginTimeOfDay.Dusk },
};
// The families of the scene's parts a witness render draws from the game's exports
export const witnessFamilies = LoginPartFamilyMeshRegexMap;
