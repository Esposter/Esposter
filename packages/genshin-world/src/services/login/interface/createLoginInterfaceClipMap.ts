import type { LoginInterfaceClip } from "#src/models/login/LoginInterfaceClip";
import type { LoginInterfaceClips } from "#src/models/login/LoginInterfaceClips";
import type { InterfaceClip } from "genshin-interface";

import { toInterfaceClip } from "genshin-interface";

// The login interface's clips as the fit sampled them from the game's own (Login/Interface/Index.reference.ts's
// Sources `fadeIn`, `startFadeIn`, `startFadeOut` and `whiteCurtain`), each made playable: which pieces each fades,
// Scales and moves, and when
export const createLoginInterfaceClipMap = (
  interfaceClips: LoginInterfaceClips,
): Record<LoginInterfaceClip, InterfaceClip> =>
  Object.fromEntries(Object.entries(interfaceClips).map(([clip, fittedClip]) => [clip, toInterfaceClip(fittedClip)]));
