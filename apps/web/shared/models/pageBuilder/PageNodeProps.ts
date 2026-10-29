import { nodeIdSchema } from "#shared/services/pageBuilder/nodeIdSchema";
import { z } from "zod";

// Every node's props carry its id, as Puck's ComponentData keeps it inside props rather than beside them
export interface PageNodeProps {
  id: string;
}

export const pageNodePropsSchema = z.object({ id: nodeIdSchema }) satisfies z.ZodType<PageNodeProps>;
