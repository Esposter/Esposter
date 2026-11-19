// The events RealtimeKit delivers to the app's webhook route, which is subscribed to these two and no other. The route
// Reads them and the script that subscribes the webhook names them, so they are declared once, here
export const RealtimeKitWebhookEvent = {
  ParticipantJoined: "meeting.participantJoined",
  ParticipantLeft: "meeting.participantLeft",
} as const;
export type RealtimeKitWebhookEvent = (typeof RealtimeKitWebhookEvent)[keyof typeof RealtimeKitWebhookEvent];
