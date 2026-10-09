import { z } from "zod";

// The login sky's three cloud bands as its fit traced them: the sea's billows, the middle cumulus and the top cumulus
export interface LoginCloudsData {
  bottom: LoginCloudBandData;
  middle: LoginCloudBandData;
  top: LoginCloudBandData;
}
// One of the login sky's cloud bands: its width over its height in its own atlas, and its sprites
interface LoginCloudBandData {
  aspect: number;
  sprites: LoginCloudSpriteData[];
}
// A cloud sprite as its fit traced it: the loops of its lit clouds and of their outlines, each loop a list of points
interface LoginCloudSpriteData {
  lit: number[][][];
  outline: number[][][];
}

const loginCloudSpriteDataSchema = z.object({
  lit: z.array(z.array(z.array(z.number()).length(2))),
  outline: z.array(z.array(z.array(z.number()).length(2))),
}) satisfies z.ZodType<LoginCloudSpriteData>;
const loginCloudBandDataSchema = z.object({
  aspect: z.number().positive(),
  sprites: z.array(loginCloudSpriteDataSchema),
}) satisfies z.ZodType<LoginCloudBandData>;

export const loginCloudsDataSchema = z.object({
  bottom: loginCloudBandDataSchema,
  middle: loginCloudBandDataSchema,
  top: loginCloudBandDataSchema,
}) satisfies z.ZodType<LoginCloudsData>;
