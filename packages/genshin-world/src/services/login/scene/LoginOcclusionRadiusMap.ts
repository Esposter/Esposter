import { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";
import { LOGIN_OCCLUSION_RADIUS } from "#src/services/login/scene/constants";

// How far each hour's screen-space occlusion reaches, its light solved under it (genshin:parity calibrate): the day's,
// The dusk's and the night's frames score better under it, the dawn's worse, so the dawn draws none
export const LoginOcclusionRadiusMap: Record<LoginTimeOfDay, number> = {
  [LoginTimeOfDay.Dawn]: 0,
  [LoginTimeOfDay.Day]: LOGIN_OCCLUSION_RADIUS,
  [LoginTimeOfDay.Dusk]: LOGIN_OCCLUSION_RADIUS,
  [LoginTimeOfDay.Night]: LOGIN_OCCLUSION_RADIUS,
};
