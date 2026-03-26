import type { Except } from "type-fest";
import type { Options } from "@koumoul/vjsf";

export interface VjsfOptions<TContext extends object = object> extends Except<Options, "context"> {
  context?: TContext;
}
