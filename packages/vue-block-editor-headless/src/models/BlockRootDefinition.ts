import type { BlockRootProps } from "#src/models/BlockRootProps";
import type { z } from "zod";

// The document's own half: the types its content accepts and the schema its props pass
export interface BlockRootDefinition<TProps extends BlockRootProps = BlockRootProps, TType extends string = string> {
  content: TType[];
  propsSchema: z.ZodType<TProps>;
}
