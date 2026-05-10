import type { Options } from "@koumoul/vjsf";
import type { Except } from "type-fest";

export interface VjsfOptions<TContext extends object = object> extends Except<Options, "context"> {
  context?: TContext;
}
