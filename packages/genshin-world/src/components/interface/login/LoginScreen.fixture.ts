import { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";

// The night sky, the English recording's, which the scene is first matched under. A scene draws every frame, its
// Anti-aliasing jittering each one, so the visual suite's screenshot never settles on it: it is judged by `compare`'s
// Shape and tone against its references alone
export const isMotionOnly = true;
export const props = { timeOfDay: LoginTimeOfDay.Night };
export const readyEvent = "ready";
