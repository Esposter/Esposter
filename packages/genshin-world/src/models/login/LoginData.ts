import type { LoginAgeRating } from "#src/models/login/LoginAgeRating";
import type { LoginCloudsData } from "#src/models/login/LoginCloudsData";
import type { LoginDoor } from "#src/models/login/LoginDoor";
import type { LoginHulls } from "#src/models/login/LoginHulls";
import type { LoginInterfaceClips } from "#src/models/login/LoginInterfaceClips";
import type { LoginInterfaceRects } from "#src/models/login/LoginInterfaceRects";
import type { LoginPavingData } from "#src/models/login/LoginPavingData";
import type { LoginScroll } from "#src/models/login/LoginScroll";
import type { LoginSky } from "#src/models/login/LoginSky";
import type { LoginSounds } from "#src/models/login/LoginSounds";
import type { LoginStone } from "#src/models/login/LoginStone";
import type { LoginStoneLight } from "#src/models/login/LoginStoneLight";
import type { LoginTowers } from "#src/models/login/LoginTowers";
import type { LoginWalkway } from "#src/models/login/LoginWalkway";
import type { CloudLayerTextureProfiles, Music } from "genshin-engine";

// Every record the login screen draws from, read whole from the hosted game data
export interface LoginData {
  ageRating: LoginAgeRating;
  cloudLayerTextures: CloudLayerTextureProfiles;
  clouds: LoginCloudsData;
  door: LoginDoor;
  hulls: LoginHulls;
  interfaceClips: LoginInterfaceClips;
  interfaceRects: LoginInterfaceRects;
  music: Music;
  paving: LoginPavingData;
  scroll: LoginScroll;
  sky: LoginSky;
  sounds: LoginSounds;
  stone: LoginStone;
  stoneLight: LoginStoneLight;
  towers: LoginTowers;
  walkway: LoginWalkway;
}
