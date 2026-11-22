import type { SlashCommandType } from "#src/models/message/slashCommands/SlashCommandType";
import type { SlashCommandDefinitionMap } from "#src/services/message/slashCommands/SlashCommandDefinitionMap";
import type { Simplify } from "type-fest";

// Every declared parameter is present as a string, an optional one the message omits as the empty string
export type SlashCommandParameters<T extends SlashCommandType> =
  (typeof SlashCommandDefinitionMap)[T]["parameters"][number] extends infer Parameters
    ? Simplify<{ [P in Extract<Parameters, { name: string }> as P["name"]]: string }>
    : never;
