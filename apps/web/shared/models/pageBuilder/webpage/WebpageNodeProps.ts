import type { NodeStyle } from "#shared/models/pageBuilder/style/NodeStyle";
import type { PageNodeProps } from "#shared/models/pageBuilder/PageNodeProps";

import { pageNodePropsSchema } from "#shared/models/pageBuilder/PageNodeProps";
import { nodeStyleSchema } from "#shared/models/pageBuilder/style/NodeStyle";
import { z } from "zod";

// What every webpage node carries beside its own props: its id, and its styles per breakpoint and state
export interface WebpageNodeProps extends PageNodeProps {
  style: NodeStyle;
}

export const webpageNodePropsSchema = z.object({
  ...pageNodePropsSchema.shape,
  style: nodeStyleSchema,
}) satisfies z.ZodType<WebpageNodeProps>;
