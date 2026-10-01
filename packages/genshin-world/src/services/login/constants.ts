import { LoginStatusStep } from "#src/models/login/LoginStatusStep";
import { TravelerGender } from "genshin-text";

// The English client's words on its login screen that no text map carries, from a 1080 high recording of it
// (`yt-rBnfA4pXw6U`); the rest are the game text's
export const LOGIN_SERVER_NAME = "Asia";
// The build string the game prints at the foot of its login screen, the one the 1440 high recording shows
export const LOGIN_VERSION_TEXT = "OSRELWin7.1.0_R48379043_S48511369_D48533839";
// The welcome card greets the player by the name their account shows, after these words
export const LOGIN_WELCOME_TEXT = "Welcome,";
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
// (`luma`): the scene fades up out of white over 800 ms, the wait mark shows from 1.3 s to 2 s, and the title comes in
// At once as it goes. The welcome card holds 1.9 s and fades over 200 ms
export const LOGIN_ARRIVE_FADE_MS = 800;
export const LOGIN_SPINNER_START_MS = 1300;
export const LOGIN_TITLE_START_MS = 2000;
export const LOGIN_WELCOME_HOLD_MS = 1900;
export const LOGIN_WELCOME_FADE_MS = 200;
// The camera's flight from the title to the door follows loading, then ends a fixed time after it: in the English
// Recording the bar is full at 8.4 s and the door rises at 11.75, about 3 s later, however long the load before it took.
// While loading, the camera flies the share of the path the recording's does before its bar is full (6.4 of its 9.75 s
// From the click, at an even pace), no faster than the last stretch's pace, so a load that ends at once glides rather
// Than jumps; once loading is done it flies whatever is left in the 3 s
export const LOGIN_DOOR_AFTER_LOAD_MS = 3000;
export const LOGIN_FLIGHT_LOADING_SHARE = 0.65;
// The bar's fill at its fastest, from empty to full: the share shown runs toward loading's own at no more than this
// Pace, so a load that finishes at once still sweeps the bar rather than jumping, and one slower is followed as it goes
export const LOGIN_PROGRESS_FILL_MS = 100;
// A click on the door lights it over 400 ms while the screen whitens over 620, easing out, from the English
// Recording at 60 frames
export const LOGIN_DOOR_LIGHT_MS = 400;
// The door's interface after the door has formed, from the English recording at 10 frames a second: formed by 12.7 s,
// The corner buttons at 13.0, and the prompt's band fading in from 13.7 to full by 14.0
export const LOGIN_DOOR_BUTTONS_DELAY_MS = 300;
export const LOGIN_DOOR_PROMPT_DELAY_MS = 1000;
export const LOGIN_DOOR_PROMPT_FADE_MS = 300;
export const LOGIN_FLASH_MS = 620;
