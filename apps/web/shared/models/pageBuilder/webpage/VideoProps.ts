import type { WebpageNodeProps } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";

import { webpageNodePropsSchema } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";
import { pageUrlSchema } from "#shared/services/pageBuilder/pageUrlSchema";
import { z } from "zod";

// An uploaded or hosted video file, played by the browser's own controls. It starts with no source rather than a
// Sample, so a page never ships a stranger's video
export interface VideoProps extends WebpageNodeProps {
  isAutoplay: boolean;
  isLoop: boolean;
  isMuted: boolean;
  poster: string;
  src: string;
}

export const videoPropsSchema = z.object({
  ...webpageNodePropsSchema.shape,
  isAutoplay: z.boolean(),
  isLoop: z.boolean(),
  isMuted: z.boolean(),
  poster: pageUrlSchema,
  src: pageUrlSchema,
}) satisfies z.ZodType<VideoProps>;
