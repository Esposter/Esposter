import type { SessionInitEvent } from "#src/models/event/SessionInitEvent";
import type { PermissionMode } from "#src/models/session/PermissionMode";
import type { SDKSystemMessage } from "@anthropic-ai/claude-agent-sdk";

import { AgentEventType } from "#src/models/event/AgentEventType";
// A list the SDK reports is deduplicated on the way in: the contract holds each name once, and one name reached
// Twice — a command a plugin and the user both define — is still one entry to pick
export const toSessionInitEvent = (
  message: SDKSystemMessage,
  permissionMode: PermissionMode,
  createdAt: Date,
): SessionInitEvent => ({
  agents: [...new Set(message.agents)],
  claudeCodeVersion: message.claude_code_version,
  createdAt,
  cwd: message.cwd,
  id: message.uuid,
  mcpServers: [...new Map(message.mcp_servers.map(({ name, status }) => [name, { name, status }])).values()],
  model: message.model,
  outputStyle: message.output_style,
  permissionMode,
  plugins: [...new Set(message.plugins.map(({ name }) => name))],
  skills: [...new Set(message.skills)],
  slashCommands: [...new Set(message.slash_commands)],
  tools: [...new Set(message.tools)],
  type: AgentEventType.SessionInit,
});
