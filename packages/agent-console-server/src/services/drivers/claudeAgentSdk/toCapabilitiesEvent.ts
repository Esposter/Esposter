import type { CapabilitiesEvent } from "#src/models/event/CapabilitiesEvent";
import type { ModelInfo, SlashCommand } from "@anthropic-ai/claude-agent-sdk";

import { AgentEventType } from "#src/models/event/AgentEventType";

// What the palette and the model picker offer, read from the session itself so they list exactly what the
// Terminal would — the person's own commands, skills and plugins included
export const toCapabilitiesEvent = (
  id: string,
  slashCommands: SlashCommand[],
  models: ModelInfo[],
  createdAt: Date,
): CapabilitiesEvent => ({
  commands: [
    ...new Map(
      slashCommands.map(({ argumentHint, description, name }) => [name, { argumentHint, description, name }]),
    ).values(),
  ],
  createdAt,
  id,
  models: [
    ...new Map(
      models.map(({ description, displayName, value }) => [value, { description, displayName, value }]),
    ).values(),
  ],
  type: AgentEventType.Capabilities,
});
