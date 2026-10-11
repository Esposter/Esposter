import type { FittedInterfaceClip } from "genshin-interface";

import { fittedInterfaceClipSchema } from "#src/models/interface/fittedInterfaceClipSchema";
import { LoginInterfaceClip } from "#src/models/login/LoginInterfaceClip";
import { z } from "zod";

// The login interface's clips the screen plays, each as its fit sampled it from the game's blocks, by the name the
// Screen plays it under; the record's other clips are dropped as it is read
export type LoginInterfaceClips = Record<LoginInterfaceClip, FittedInterfaceClip>;

export const loginInterfaceClipsSchema = z.object({
  [LoginInterfaceClip.FadeIn]: fittedInterfaceClipSchema,
  [LoginInterfaceClip.FadeOut]: fittedInterfaceClipSchema,
  [LoginInterfaceClip.StartFadeIn]: fittedInterfaceClipSchema,
  [LoginInterfaceClip.StartFadeOut]: fittedInterfaceClipSchema,
  [LoginInterfaceClip.WhiteCurtain]: fittedInterfaceClipSchema,
}) satisfies z.ZodType<LoginInterfaceClips>;
