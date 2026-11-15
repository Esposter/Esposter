export const WebhookDialogAction = { Delete: "Delete", Regenerate: "Regenerate" } as const;
export type WebhookDialogAction = (typeof WebhookDialogAction)[keyof typeof WebhookDialogAction];
