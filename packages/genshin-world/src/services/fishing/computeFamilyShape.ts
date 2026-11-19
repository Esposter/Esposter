// A family asset's drawn shape: its fitted parameters when a fit has written them, and its stand-in until one has
export const computeFamilyShape = <Fitted, StandIn>(fitted: Fitted | undefined, standIn: StandIn): Fitted | StandIn =>
  fitted ?? standIn;
