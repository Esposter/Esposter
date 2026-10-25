import type { OptionalParameters } from "@/models/message/slashCommands/OptionalParameters";
import type { RequiredParameters } from "@/models/message/slashCommands/RequiredParameters";
import type { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import type { SlashCommandDefinitionMap } from "@/services/message/slashCommands/SlashCommandDefinitionMap";
import type { Simplify } from "type-fest";

export type SlashCommandParameters<T extends SlashCommandType> =
  (typeof SlashCommandDefinitionMap)[T]["parameters"][number] extends infer Parameters
    ? Simplify<OptionalParameters<Parameters> & RequiredParameters<Parameters>>
    : never;
