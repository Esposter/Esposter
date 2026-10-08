import { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";
import { LOGIN_NIGHT_SHADOW_INTENSITY, LOGIN_SHADOW_INTENSITY } from "#src/services/login/scene/constants";

// The strength each hour's light shadow is cast at: the night's moon at its own, the other hours at the light's
export const LoginShadowIntensityMap: Record<LoginTimeOfDay, number> = {
  [LoginTimeOfDay.Dawn]: LOGIN_SHADOW_INTENSITY,
  [LoginTimeOfDay.Day]: LOGIN_SHADOW_INTENSITY,
  [LoginTimeOfDay.Dusk]: LOGIN_SHADOW_INTENSITY,
  [LoginTimeOfDay.Night]: LOGIN_NIGHT_SHADOW_INTENSITY,
};
