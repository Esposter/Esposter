enum MessageType {
  /// ... existing values
  Webhook,
  NewType,
  // other types
}

const satisfiesType: MessageType = MessageType.NewType; // updated to exclude Webhook
