import type { CloudLayerDome, SkyGradient } from "genshin-engine";

import { z } from "zod";

// The login sky as its fit drew it: its cloud layer's dome, the material that layer is drawn with, and its gradient
// Up the sky
export interface LoginSky {
  cloudLayer: CloudLayerDome;
  cloudLayerMaterial: LoginSkyCloudLayerMaterial;
  gradient: SkyGradient;
}
// The material the login sky's cloud layer is drawn with: its curl's amplitude, speed and tiling, its wisps' opacity
interface LoginSkyCloudLayerMaterial {
  curlAmplitude: number;
  curlSpeed: number;
  curlTiling: number;
  wispsOpacity: number;
}

const cloudLayerDomeSchema = z.object({
  center: z.array(z.number()).length(2),
  elevations: z.array(z.number()),
  far: z.array(z.number()),
  near: z.array(z.number()),
  normalElevations: z.array(z.number()),
  turn: z.number(),
  wisps: z.array(z.number()),
  wispsTurn: z.number(),
}) satisfies z.ZodType<CloudLayerDome>;
const skyGradientSchema = z.object({
  green: z.array(z.number()),
  red: z.array(z.number()),
}) satisfies z.ZodType<SkyGradient>;

const loginSkyCloudLayerMaterialSchema = z.object({
  curlAmplitude: z.number(),
  curlSpeed: z.number(),
  curlTiling: z.number(),
  wispsOpacity: z.number(),
}) satisfies z.ZodType<LoginSkyCloudLayerMaterial>;

export const loginSkySchema = z.object({
  cloudLayer: cloudLayerDomeSchema,
  cloudLayerMaterial: loginSkyCloudLayerMaterialSchema,
  gradient: skyGradientSchema,
}) satisfies z.ZodType<LoginSky>;
