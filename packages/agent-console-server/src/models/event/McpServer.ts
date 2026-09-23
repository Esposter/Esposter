import { z } from "zod";

export interface McpServer {
  name: string;
  status: string;
}

export const mcpServerSchema: z.ZodObject<{ name: z.ZodString; status: z.ZodString }> = z.object({
  name: z.string(),
  status: z.string(),
}) satisfies z.ZodType<McpServer>;
