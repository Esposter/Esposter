import type { TextConfiguration } from "@/models/configuration/TextConfiguration";
import type { SetRequired } from "type-fest";

export interface TextProps {
  configuration: SetRequired<Partial<TextConfiguration>, "text">;
  immediate?: true;
}
