import type { FittedInterfaceRect } from "genshin-interface";

import { fittedInterfaceRectSchema } from "#src/models/interface/fittedInterfaceRectSchema";
import { LoginInterfaceRectName } from "#src/models/login/LoginInterfaceRectName";
import { z } from "zod";

// The login interface's fitted RectTransforms the screen places its pieces by, each by its path in the game's tree. The
// Fit publishes every piece of the tree, and the pieces the screen does not place are dropped as the record is read
export type LoginInterfaceRects = Record<LoginInterfaceRectName, FittedInterfaceRect>;

export const loginInterfaceRectsSchema = z.object({
  [LoginInterfaceRectName.Background]: fittedInterfaceRectSchema,
  [LoginInterfaceRectName.Bottom]: fittedInterfaceRectSchema,
  [LoginInterfaceRectName.Center]: fittedInterfaceRectSchema,
  [LoginInterfaceRectName.CurrentAccount]: fittedInterfaceRectSchema,
  [LoginInterfaceRectName.LeftButtons]: fittedInterfaceRectSchema,
  [LoginInterfaceRectName.Login]: fittedInterfaceRectSchema,
  [LoginInterfaceRectName.PressStart]: fittedInterfaceRectSchema,
  [LoginInterfaceRectName.RatingBadge]: fittedInterfaceRectSchema,
  [LoginInterfaceRectName.RightButtons]: fittedInterfaceRectSchema,
  [LoginInterfaceRectName.Server]: fittedInterfaceRectSchema,
  [LoginInterfaceRectName.Start]: fittedInterfaceRectSchema,
  [LoginInterfaceRectName.SwitchServer]: fittedInterfaceRectSchema,
  [LoginInterfaceRectName.Version]: fittedInterfaceRectSchema,
  [LoginInterfaceRectName.WhiteScreen]: fittedInterfaceRectSchema,
}) satisfies z.ZodType<LoginInterfaceRects>;
