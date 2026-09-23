import type { BaseAgentEvent } from "#src/models/event/BaseAgentEvent";
import type { McpServer } from "#src/models/event/McpServer";
import type { PermissionMode } from "#src/models/session/PermissionMode";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { createBaseAgentEventSchema } from "#src/models/event/BaseAgentEvent";
import { mcpServerSchema } from "#src/models/event/McpServer";
import { permissionModeSchema } from "#src/models/session/PermissionMode";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export interface SessionInitEvent extends BaseAgentEvent<AgentEventType.SessionInit> {
  agents: string[];
  claudeCodeVersion: string;
  cwd: string;
  mcpServers: McpServer[];
  model: string;
  outputStyle: string;
  permissionMode: PermissionMode;
  plugins: string[];
  skills: string[];
  slashCommands: string[];
  tools: string[];
}

export const sessionInitEventSchema: z.ZodObject<{
  agents: z.ZodArray<z.ZodString>;
  claudeCodeVersion: z.ZodString;
  createdAt: z.ZodCoercedDate;
  cwd: z.ZodString;
  id: z.ZodString;
  mcpServers: z.ZodArray<typeof mcpServerSchema>;
  model: z.ZodString;
  outputStyle: z.ZodString;
  permissionMode: typeof permissionModeSchema;
  plugins: z.ZodArray<z.ZodString>;
  skills: z.ZodArray<z.ZodString>;
  slashCommands: z.ZodArray<z.ZodString>;
  tools: z.ZodArray<z.ZodString>;
  type: z.ZodLiteral<AgentEventType.SessionInit>;
}> = z.object({
  ...createBaseAgentEventSchema(z.literal(AgentEventType.SessionInit)).shape,
  agents: createUniqueArraySchema(z.string()),
  claudeCodeVersion: z.string(),
  cwd: z.string(),
  mcpServers: createUniqueArraySchema(mcpServerSchema, "name"),
  model: z.string(),
  outputStyle: z.string(),
  permissionMode: permissionModeSchema,
  plugins: createUniqueArraySchema(z.string()),
  skills: createUniqueArraySchema(z.string()),
  slashCommands: createUniqueArraySchema(z.string()),
  tools: createUniqueArraySchema(z.string()),
}) satisfies z.ZodType<SessionInitEvent>;
