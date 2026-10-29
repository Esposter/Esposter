import { checkIsBalancedStyleValue } from "#shared/services/pageBuilder/style/checkIsBalancedStyleValue";
import { MAX_STYLE_VALUE_LENGTH, STYLE_VALUE_REGEX } from "#shared/services/pageBuilder/style/constants";
import { z } from "zod";

export const styleValueSchema = z
  .string()
  .max(MAX_STYLE_VALUE_LENGTH)
  .regex(STYLE_VALUE_REGEX)
  .refine(checkIsBalancedStyleValue, { error: "Every quote and bracket a value opens it closes" });
