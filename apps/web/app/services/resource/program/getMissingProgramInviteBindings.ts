import type { ProgramResource } from "#shared/models/resource/program/ProgramResource";

// The bindings an invite needs, named for the owner so a refused export says what to bind on the Setup blade
export const getMissingProgramInviteBindings = ({
  audience,
  emailId,
  keyColumn,
  surveyId,
}: ProgramResource): string[] =>
  [!emailId && "an email", !audience && "an audience", !keyColumn && "a key column", !surveyId && "a survey"].filter(
    (binding): binding is string => Boolean(binding),
  );
