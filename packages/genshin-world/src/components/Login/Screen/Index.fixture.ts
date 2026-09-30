import { LoginStage } from "#src/models/login/LoginStage";
import { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";

// The night sky at the title's pose, the English recording's, which the scene is first matched under. A scene draws
// Every frame, its anti-aliasing jittering each one, so the visual suite's screenshot never settles on it: it is judged
// By `compare`'s shape and tone against its references alone
export const isMotionOnly = true;
export const props = { progress: 0, stage: LoginStage.Title, timeOfDay: LoginTimeOfDay.Night };
export const readyEvent = "ready";
