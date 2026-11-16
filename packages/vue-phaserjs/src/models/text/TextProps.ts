import type { TextConfiguration } from "#src/models/configuration/TextConfiguration";
import type { SetRequired, UndefinedOnPartial } from "type-fest";

export interface TextProps {
  configuration: UndefinedOnPartial<SetRequired<Partial<TextConfiguration>, "text">>;
  immediate?: true;
}
