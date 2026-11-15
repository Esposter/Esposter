import type { OptionalParameters } from "#src/models/message/slashCommands/OptionalParameters";
import type { RequiredParameters } from "#src/models/message/slashCommands/RequiredParameters";
import type { SlashCommandType } from "#src/models/message/slashCommands/SlashCommandType";
import type { SlashCommandDefinitionMap } from "#src/services/message/slashCommands/SlashCommandDefinitionMap";
import type { Simplify } from "type-fest";

export type SlashCommandParameters<T extends SlashCommandType> =
  (typeof SlashCommandDefinitionMap)[T]["parameters"][number] extends infer Parameters
    ? Simplify<OptionalParameters<Parameters> & RequiredParameters<Parameters>>
    : never;
