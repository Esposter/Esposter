import type { WebpageNodeProps } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";

import { webpageNodePropsSchema } from "#shared/models/pageBuilder/webpage/WebpageNodeProps";
import { MAX_MAP_ZOOM } from "#shared/services/pageBuilder/webpage/map/constants";
import { pageTextSchema } from "#shared/services/pageBuilder/pageTextSchema";
import { z } from "zod";

// A Google Maps embed of an address. Its frame's title is required, since a frame is announced by it
export interface MapProps extends WebpageNodeProps {
  address: string;
  title: string;
  zoom: number;
}

export const mapPropsSchema = z.object({
  ...webpageNodePropsSchema.shape,
  address: pageTextSchema,
  title: pageTextSchema.min(1),
  zoom: z.int().min(1).max(MAX_MAP_ZOOM),
}) satisfies z.ZodType<MapProps>;
