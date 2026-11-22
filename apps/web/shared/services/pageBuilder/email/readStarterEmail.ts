import { MAX_EMAIL_NODES } from "#shared/services/pageBuilder/email/constants";
import { emailBodyChildrenSchema } from "#shared/services/pageBuilder/email/emailNodeSchema";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { noteRichText } from "#shared/services/pageBuilder/email/noteRichText";
import { STARTER_EMAIL_SOURCE } from "#shared/services/pageBuilder/email/starterEmailSource";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { parseMjmlDocument } from "mjml-blocks";

// The document a new email is written from, read back from the MJML it is written in. The starter is ours, so a failure
// To read it is a broken build, which the starter's own test catches before it ships
export const readStarterEmail = () => {
  const result = parseMjmlDocument(
    STARTER_EMAIL_SOURCE,
    emailRegistry,
    emailBodyChildrenSchema,
    noteRichText,
    MAX_EMAIL_NODES,
  );
  if (!result.success)
    throw new InvalidOperationError(
      Operation.Read,
      readStarterEmail.name,
      "The starter email does not read back as an email",
    );

  return result.data;
};
