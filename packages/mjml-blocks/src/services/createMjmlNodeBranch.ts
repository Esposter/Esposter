import { MJML_NAME_MAX_LENGTH } from "#src/services/constants";
import { z } from "zod";

// A node's branch of its union: its type tag, its props checked by the props schema's own refinements once the shape passes, its id and each slot's children.
// The props schema is parsed again for those refinements, because a spread of its shape brings the fields and leaves its
// Whole-object checks behind, and zod offers no public way to carry them over that also holds them back while the shape
// Has an issue: a refinement run past an unrecognised key reports a second, misleading problem.
export const createMjmlNodeBranch = <
  TType extends string,
  TPropsShape extends z.core.$ZodLooseShape,
  TSlotShape extends z.core.$ZodLooseShape,
>(
  type: TType,
  propsSchema: z.ZodObject<TPropsShape, z.core.$strict>,
  slots: TSlotShape,
): z.ZodObject<{
  props: z.ZodObject<TPropsShape & TSlotShape & { id: z.ZodString }, z.core.$strict>;
  type: z.ZodLiteral<TType>;
}> => {
  const declaredKeys = Object.keys(propsSchema.shape);
  const props = z
    .strictObject({ ...propsSchema.shape, id: z.string().max(MJML_NAME_MAX_LENGTH), ...slots })
    .superRefine(
      (value, context) => {
        const declaredProps = Object.fromEntries(
          Object.entries(value).filter(([key]) => declaredKeys.includes(String(key))),
        );
        for (const { message, path } of propsSchema.safeParse(declaredProps).error?.issues ?? [])
          context.addIssue({ code: "custom", message, path });
      },
      { when: ({ issues }) => issues.length === 0 },
    );
  return z.object({ props, type: z.literal(type) });
};
