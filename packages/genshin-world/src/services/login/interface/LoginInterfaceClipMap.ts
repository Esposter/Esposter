import type { InterfaceClip } from "genshin-ui";

import interfaceClips from "#src/data/login/interfaceClips.json";
import { LoginInterfaceClip } from "#src/models/login/LoginInterfaceClip";
import { readInterfaceClip } from "genshin-ui";

const nameClipMap: Record<string, Parameters<typeof readInterfaceClip>[0] | undefined> = interfaceClips;
const readClip = (name: LoginInterfaceClip): InterfaceClip =>
  readInterfaceClip(nameClipMap[name] ?? { durationMs: 0, tracks: [] });
// The login interface's clips as the fit sampled them from the game's own (Login/Interface/Index.reference.ts's
// Sources `fadeIn`, `startFadeIn`, `startFadeOut` and `whiteCurtain`): which pieces each fades, scales and moves, and
// When
export const LoginInterfaceClipMap: Record<LoginInterfaceClip, InterfaceClip> = {
  [LoginInterfaceClip.FadeIn]: readClip(LoginInterfaceClip.FadeIn),
  [LoginInterfaceClip.FadeOut]: readClip(LoginInterfaceClip.FadeOut),
  [LoginInterfaceClip.StartFadeIn]: readClip(LoginInterfaceClip.StartFadeIn),
  [LoginInterfaceClip.StartFadeOut]: readClip(LoginInterfaceClip.StartFadeOut),
  [LoginInterfaceClip.WhiteCurtain]: readClip(LoginInterfaceClip.WhiteCurtain),
};
