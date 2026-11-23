import { surveyInviteNodeType } from "#shared/services/pageBuilder/surveyInviteNodeType";

// The survey invite's form and props in an email: the webpage invite's, with no element id, since an email's elements
// Are not linked to
export const emailSurveyInviteFormSchema = surveyInviteNodeType.formSchema.omit({ elementId: true });
export const emailSurveyInvitePropsSchema = surveyInviteNodeType.propsSchema.omit({ elementId: true });
