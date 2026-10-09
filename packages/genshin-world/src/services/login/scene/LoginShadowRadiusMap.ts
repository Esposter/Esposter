import { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";
import { LOGIN_NIGHT_SHADOW_RADIUS, LOGIN_SHADOW_RADIUS } from "#src/services/login/scene/constants";

// The softness each hour's light shadow is filtered at: the night's moon at its own, the other hours at the light's
export const LoginShadowRadiusMap: Record<LoginTimeOfDay, number> = {
  [LoginTimeOfDay.Dawn]: LOGIN_SHADOW_RADIUS,
  [LoginTimeOfDay.Day]: LOGIN_SHADOW_RADIUS,
  [LoginTimeOfDay.Dusk]: LOGIN_SHADOW_RADIUS,
  [LoginTimeOfDay.Night]: LOGIN_NIGHT_SHADOW_RADIUS,
};
