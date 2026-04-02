import type { Description } from "#shared/models/entity/Description";
import type { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import type { ItemEntityType } from "@esposter/shared";

export interface SlashCommand extends Description, ItemEntityType<SlashCommandType> {
  icon: string;
  title: string;
}
