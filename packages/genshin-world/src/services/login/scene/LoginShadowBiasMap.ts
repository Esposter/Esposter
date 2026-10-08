import { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";
import { LOGIN_NIGHT_SHADOW_BIAS, LOGIN_SHADOW_BIAS } from "#src/services/login/scene/constants";

// The bias each hour's light shadow is read through: the night's moon at its own, the other hours at the light's
export const LoginShadowBiasMap: Record<LoginTimeOfDay, number> = {
  [LoginTimeOfDay.Dawn]: LOGIN_SHADOW_BIAS,
  [LoginTimeOfDay.Day]: LOGIN_SHADOW_BIAS,
  [LoginTimeOfDay.Dusk]: LOGIN_SHADOW_BIAS,
  [LoginTimeOfDay.Night]: LOGIN_NIGHT_SHADOW_BIAS,
};
