import { SECRET_TOKEN_LENGTH } from "#src/util/secret/constants";
import { z } from "zod";

// The shape a bearer credential has when it is issued, so a value of any other shape is refused where it arrives
export const secretTokenSchema: z.ZodString = z.base64url().length(SECRET_TOKEN_LENGTH);
