import type { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import type { SlashCommandDefinitionMap } from "@/services/message/slashCommands/SlashCommandDefinitionMap";
import type { Simplify } from "type-fest";

export type SlashCommandParameters<T extends SlashCommandType> =
  (typeof SlashCommandDefinitionMap)[T]["parameters"][number] extends infer Parameters
    ? Simplify<OptionalParameters<Parameters> & RequiredParameters<Parameters>>
    : never;

type OptionalParameters<Parameters> = {
  [P in Extract<Parameters, { isRequired: false; name: string }> as P["name"]]?: string;
};

type RequiredParameters<Parameters> = {
  [P in Extract<Parameters, { isRequired: true; name: string }> as P["name"]]: string;
};
