import type { SurfaceDetail } from "genshin-engine";
import type { Object3D } from "three";

import { LoginStatusStep } from "#src/models/login/LoginStatusStep";
import { TravelerGender } from "genshin-text";

// The server the English recording's account is on (`yt-rBnfA4pXw6U`, 1080 high): the game names its servers from the
// List it is sent, so no text of its own carries the name
export const LOGIN_SERVER_NAME = "Asia";
// The folder the login scene's exports are extracted into, which the scene reads them from under a host that serves
// Them
export const LOGIN_SCENE_EXPORT_COMPONENT = "login";
// The empty list a frame reads while the witness has no exported parts, named once so a frame builds none
export const LOGIN_NO_EXPORTED_GROUPS: readonly Object3D[] = [];
// Which twin a player who has not named themselves is called after, in a language with a word per gender
export const LOGIN_TRAVELER_GENDER = TravelerGender.Female;
// The status the foot shows as the game prepares, each from the moment given after the title's click; the game says
// Them as fast as its checks run, so these are the English recording's own pace
export const LOGIN_STATUS_STEPS: readonly { ms: number; step: LoginStatusStep }[] = [
  { ms: 0, step: LoginStatusStep.PreparingDownload },
  { ms: 450, step: LoginStatusStep.CheckingForUpdates },
  { ms: 800, step: LoginStatusStep.LoadingGame },
  { ms: 1400, step: LoginStatusStep.LoadingData },
];
// Timings from the 1440 high recording at 10 frames and the English one at 60, each read as a curve over its region
// (`luma`): the wait mark shows from 1.3 s to 2 s, and the title comes in as it goes. The welcome card, which the
// Account kit drops in as the player signs in, holds 1.9 s and fades over 200 ms; the screen does not show it until it
// Has an account to welcome
export const LOGIN_SPINNER_START_MS = 1300;
export const LOGIN_TITLE_START_MS = 2000;
export const LOGIN_WELCOME_FADE_MS = 200;
// The camera's flight from the title to the door follows loading, then ends a fixed time after it: in the English
// Recording the bar is full at 8.4 s and the door rises at 11.75, about 3 s later, however long the load before it
// Took. While loading, the camera flies the share of the path the recording's does before its bar is full (6.4 of its
// 9.75 s from the click, at an even pace), no faster than the last stretch's pace, so a load that ends at once glides
// Rather than jumps; once loading is done it flies whatever is left while the status row folds and fades, and the door
// Is due. The glide then carries the door's copy to the walkway's far end at its own pace, where the door rises, rising
// On average about as long after the bar fills as the recording's does
export const LOGIN_DOOR_AFTER_LOAD_MS = 500;
export const LOGIN_FLIGHT_LOADING_SHARE = 0.65;
// The bar's fill at its fastest, from empty to full: the share shown runs toward loading's own at no more than this
// Pace, so a load that finishes at once still sweeps the bar rather than jumping, and one slower is followed as it goes
export const LOGIN_PROGRESS_FILL_MS = 100;
// A click on the door lights it over 400 ms, from the English recording at 60 frames, while the screen whitens as the
// Game's own clip does
export const LOGIN_DOOR_LIGHT_MS = 400;
// The door's sound starts this long after the click, from the English recording: its screen first whitens at 14.633
// Seconds and the sound's rumble rises from 14.95, fitted over the burst its audio holds above the music
export const LOGIN_DOOR_SOUND_DELAY_MS = 320;
// The door's forming is a low layer of our own noise, the 63 hertz octave band of `createNoiseBuffer`, where the
// Recording's layer holds between -27 and -30 decibels from 12.0 to 13.5 seconds in its band under 150 hertz. Its
// Envelope spans the recording's layer from its 11.0-second onset to its fall
export const LOGIN_DOOR_FORMING_LEVEL_DECIBELS = -27;
export const LOGIN_DOOR_FORMING_ATTACK_MS = 1000;
export const LOGIN_DOOR_FORMING_HOLD_MS = 1500;
export const LOGIN_DOOR_FORMING_RELEASE_MS = 400;
// The door's forming, and its low layer with it, begins this long before the door rises, measured at the glide's pace:
// From the English recording, the layer starts at 11.0 seconds and the first piece rises at 11.75
export const LOGIN_DOOR_FORMING_LEAD_MS = 750;
// The effects bus's compressor the door's sounds pass in the game's mix, read from its banks: -9 decibels, 4 to 1, no
// Attack, 0.15 seconds' release. The door's data already carries the master's 5 decibels down, so the threshold sits
// 5 lower to compress the same signal; its detector is unpublished, so the browser's own stands in
export const LOGIN_EFFECTS_COMPRESSOR_OPTIONS = {
  attack: 0,
  knee: 0,
  ratio: 4,
  release: 0.15,
  threshold: -14,
} as const satisfies DynamicsCompressorOptions;
// The master's peak limiter, -2 decibels at 50 to 1 in the game's mix, at the most a browser's compressor takes, 20 to
// 1, and the release the effects bus's compressor holds, the master's own being unread
export const LOGIN_MASTER_LIMITER_OPTIONS = {
  attack: 0,
  knee: 0,
  ratio: 20,
  release: 0.15,
  threshold: -2,
} as const satisfies DynamicsCompressorOptions;
// The door's interface after the door has formed, from the English recording at 10 frames a second: formed by 12.7 s,
// The corner buttons at 13.0, and the prompt's band fading in from 13.7 to full by 14.0
export const LOGIN_DOOR_BUTTONS_DELAY_MS = 300;
export const LOGIN_DOOR_PROMPT_DELAY_MS = 1000;
export const LOGIN_DOOR_PROMPT_FADE_MS = 300;
// The last stretch's pace, a share of the path a millisecond, which bounds the flight while loading too
export const LOGIN_LAST_STRETCH_PACE: number = (1 - LOGIN_FLIGHT_LOADING_SHARE) / LOGIN_DOOR_AFTER_LOAD_MS;
// The procedural normal detail the bridges' stone leans its normals by: a cell as wide as the exports' own surface
// Wavelength read from their frame (21.8913 metres), and the amplitude that brings our mean lean to the exports' bend
// Of 1.7607 degrees, solved at that wavelength (openspec/changes/genshin-recreation-passes/design.md)
export const LOGIN_BRIDGE_NORMAL_DETAIL_WAVELENGTH = 21.8913;
export const LOGIN_BRIDGE_NORMAL_DETAIL_AMPLITUDE = 0.8388;
// The bridges' grain: their exports' structure over their pixels (the surface pass's terms, variance then bands finest
// First), each divided by their mean lightness of 0.6256 squared as the textures' statistics are relative, and scaled
// By the ratio the surface pass read our grain's terms at against the exports' (0.20 to 0.26), since a colour's
// Multiplier moves its lightness at a fraction of its own share. At a pixel's 0.2280 metres at the bridges' depth, the
// Octave amplitudes that reproduce these are solved by `computeSurfaceOctaves`
export const LOGIN_BRIDGE_SURFACE_DETAIL: SurfaceDetail = {
  bands: [0.00083468, 0.00017876, 0.00009911, 0.000058],
  metresPerTexel: 0.228,
  variance: 0.0023388,
};
