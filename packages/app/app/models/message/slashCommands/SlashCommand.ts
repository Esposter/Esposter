import type { Description } from "#shared/models/entity/Description";
import type { SlashCommandParameter } from "@/models/message/slashCommands/SlashCommandParameter";
import type { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import type { ItemEntityType } from "@esposter/shared";

export interface SlashCommand extends Description, ItemEntityType<SlashCommandType> {
  icon: string;
  parameters: SlashCommandParameter[];
  title: string;
}
