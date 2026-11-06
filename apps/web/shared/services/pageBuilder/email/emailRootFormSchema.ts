import { z } from "zod";

// The root's form holds no field. Its preview line, the text an inbox shows under the subject, is the editor bar's, so the
// Settings panel draws nothing until the head has another prop to edit
export const emailRootFormSchema = z.strictObject({});
