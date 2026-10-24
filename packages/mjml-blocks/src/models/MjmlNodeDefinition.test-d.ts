import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlButtonNode } from "#src/models/MjmlButtonNode";
import type { MjmlNodeDefinition } from "#src/models/MjmlNodeDefinition";
import type { MjmlTextProps } from "#src/models/MjmlTextProps";
import type { OwnProps } from "headless-block-editor";
import type { z } from "zod";

import { describe, expect, expectTypeOf, test } from "vitest";

declare const buttonDefinition: MjmlBlockTypeDefinition<MjmlButtonNode>;
declare const textPropsSchema: z.ZodType<OwnProps<MjmlTextProps>>;

describe("mjmlNodeDefinition type", () => {
  test("a button definition given the text props schema is refused", () => {
    expect.hasAssertions();

    // @ts-expect-error: TS2322 - the text props schema is not the props schema of the button
    const definition: MjmlNodeDefinition = { ...buttonDefinition, propsSchema: textPropsSchema };
    expectTypeOf(definition).toEqualTypeOf<MjmlNodeDefinition>();
  });
});
