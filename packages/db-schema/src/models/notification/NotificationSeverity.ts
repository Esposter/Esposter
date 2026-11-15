// Values are the UI's status token names, so a severity is handed straight to a toast or an alert without a
// Translation table between the stored value and the rendered one
export const NotificationSeverity = { Error: "error", Info: "info", Success: "success", Warning: "warning" } as const;
export type NotificationSeverity = (typeof NotificationSeverity)[keyof typeof NotificationSeverity];
