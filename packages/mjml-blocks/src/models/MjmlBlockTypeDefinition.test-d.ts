import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlButtonNode } from "#src/models/MjmlButtonNode";
import type { MjmlNodeDefinition } from "#src/models/MjmlNodeDefinition";
import type { z } from "zod";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { describe, expect, expectTypeOf, test } from "vitest";

declare const definitionFields: Pick<
  MjmlBlockTypeDefinition,
  "allowedAttributes" | "defaultAttributes" | "hasAlternativeText" | "render" | "slots" | "type"
>;
declare const buttonFields: Pick<
  MjmlBlockTypeDefinition<MjmlButtonNode>,
  "allowedAttributes" | "defaultAttributes" | "hasAlternativeText" | "render" | "slots" | "type"
>;
declare const numberContentSchema: z.ZodObject<{ content: z.ZodNumber }>;
declare const stringContentSchema: z.ZodObject<{ content: z.ZodString }>;

describe("mjmlBlockTypeDefinition content kind", () => {
  test("a label-kind definition holding a number content schema is refused on the generic path", () => {
    expect.hasAssertions();

    // @ts-expect-error: a label's content is a string, so a number content schema is refused
    const definition: MjmlBlockTypeDefinition = {
      ...definitionFields,
      contentKind: MjmlContentKind.Label,
      propsSchema: numberContentSchema,
    };
    expectTypeOf(definition).toEqualTypeOf<MjmlBlockTypeDefinition>();
  });

  test("a raw-kind definition holding a number content schema is refused on the generic path", () => {
    expect.hasAssertions();

    // @ts-expect-error: a raw's content is a string, so a number content schema is refused
    const definition: MjmlBlockTypeDefinition = {
      ...definitionFields,
      contentKind: MjmlContentKind.Raw,
      propsSchema: numberContentSchema,
    };
    expectTypeOf(definition).toEqualTypeOf<MjmlBlockTypeDefinition>();
  });

  test("a label-kind button definition holding a number content schema is refused on the node path", () => {
    expect.hasAssertions();

    const definition: MjmlNodeDefinition<MjmlButtonNode> = {
      ...buttonFields,
      contentKind: MjmlContentKind.Label,
      // @ts-expect-error: a label's content is a string, so a number content schema is refused
      propsSchema: numberContentSchema,
    };
    expectTypeOf(definition).toEqualTypeOf<MjmlNodeDefinition<MjmlButtonNode>>();
  });

  test("a label-kind definition holding a string content schema is accepted", () => {
    expect.hasAssertions();

    const definition = {
      ...definitionFields,
      contentKind: MjmlContentKind.Label,
      propsSchema: stringContentSchema,
    } satisfies MjmlBlockTypeDefinition;
    expectTypeOf(definition.contentKind).toEqualTypeOf<MjmlContentKind.Label>();
  });
});
