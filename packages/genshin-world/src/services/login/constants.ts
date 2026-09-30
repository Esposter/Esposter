import { LoginStatusStep } from "#src/models/login/LoginStatusStep";

// The English client's words on its login screen, from a 1080 high recording of it (`yt-rBnfA4pXw6U`)
export const LOGIN_TITLE_TEXT = "START GAME";
export const LOGIN_BEGIN_TEXT = "CLICK TO BEGIN";
export const LOGIN_USER_LABEL = "User";
export const LOGIN_SERVER_NAME = "Asia";
// The build string the game prints at the foot of its login screen, the one the 1440 high recording shows
export const LOGIN_VERSION_TEXT = "OSRELWin7.1.0_R48379043_S48511369_D48533839";
// The welcome card greets the player by the name their account shows, after these words
export const LOGIN_WELCOME_TEXT = "Welcome,";
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
// The camera's flight from the title to the door, at its fastest: it flies no further than loading has gone, so a
// Slow load draws it out (17 s in the 1440 high recording) while a fast one takes this long (the English recording's,
// Less the two seconds it stalls for)
export const LOGIN_FLIGHT_MS = 8900;
// The bar's fill at its fastest, from empty to full: the share shown runs toward loading's own at no more than this
// Pace, so a load that finishes at once still sweeps the bar rather than jumping, and one slower is followed as it goes
export const LOGIN_PROGRESS_FILL_MS = 100;
// A click on the door lights it over 400 ms while the screen whitens over 620, easing out, from the English
// Recording at 60 frames
export const LOGIN_DOOR_LIGHT_MS = 400;
export const LOGIN_FLASH_MS = 620;
