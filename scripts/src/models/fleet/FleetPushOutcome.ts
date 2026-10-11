// How a leased push to a fleet ref ended: landed, refused because the ref is held at another commit, or refused because
// The ref is gone. A failure nothing refused, the ref still where the lease expected it or the remote not answering, is
// Thrown instead
export enum FleetPushOutcome {
  Gone = "Gone",
  Pushed = "Pushed",
  Refused = "Refused",
}
