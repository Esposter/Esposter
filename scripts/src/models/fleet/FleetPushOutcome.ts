// How a leased push to a fleet ref ended: landed, refused because the ref is held at another commit, or refused because
// The ref is gone. A failure that reached no remote at all is thrown instead
export enum FleetPushOutcome {
  Gone = "Gone",
  Pushed = "Pushed",
  Refused = "Refused",
}
