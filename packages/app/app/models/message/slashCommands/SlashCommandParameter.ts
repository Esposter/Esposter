import type { Description } from "#shared/models/entity/Description";

export interface SlashCommandParameter extends Description {
  name: string;
  isRequired: boolean;
}
