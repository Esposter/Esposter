import type { FittedInterfaceRect } from "genshin-interface";

import { HudInterfaceRectName } from "#src/models/hud/HudInterfaceRectName";
import { fittedInterfaceRectSchema } from "#src/models/interface/fittedInterfaceRectSchema";
import { z } from "zod";

// The HUD's fitted RectTransforms the screen places its pieces by, each by its path in the game's tree. The fit
// Publishes every piece of the tree, and the pieces the screen does not draw are dropped as the record is read
export type HudInterfaceRects = Record<HudInterfaceRectName, FittedInterfaceRect>;

export const hudInterfaceRectsSchema = z.object({
  [HudInterfaceRectName.ActionButtons]: fittedInterfaceRectSchema,
  [HudInterfaceRectName.BackMap]: fittedInterfaceRectSchema,
  [HudInterfaceRectName.HealthBarContainer]: fittedInterfaceRectSchema,
  [HudInterfaceRectName.MainPage]: fittedInterfaceRectSchema,
  [HudInterfaceRectName.MapInfo]: fittedInterfaceRectSchema,
  [HudInterfaceRectName.MiniMap]: fittedInterfaceRectSchema,
  [HudInterfaceRectName.PlayerProfileButton]: fittedInterfaceRectSchema,
  [HudInterfaceRectName.StaminaBar]: fittedInterfaceRectSchema,
  [HudInterfaceRectName.TeamButtonContainer]: fittedInterfaceRectSchema,
}) satisfies z.ZodType<HudInterfaceRects>;
