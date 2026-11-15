// Each node type an email adds to the MJML blocks' set, named by the type tag its node carries in the document
export const EmailNodeType = { SurveyInvite: "survey-invite" } as const;
export type EmailNodeType = (typeof EmailNodeType)[keyof typeof EmailNodeType];
