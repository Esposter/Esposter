import { createNameSchema, RESOURCE_NAME_MAX_LENGTH } from "@esposter/db-schema";

const resourceNameSchema = createNameSchema(RESOURCE_NAME_MAX_LENGTH);

export const resourceNameRules = [
  (value: string) => {
    const result = resourceNameSchema.safeParse(value);
    return result.success || (result.error.issues[0]?.message ?? "Invalid name");
  },
];
