// The moments the terminal reaches the model at: a permission, a question or an idle prompt wants the person, and a
// Turn is over. The motion map is keyed by these, so the verb and both hooks name them the same way
export enum ViewerMoment {
  Attention = "attention",
  TurnEnd = "turnEnd",
}

export const ViewerMoments: readonly ViewerMoment[] = Object.values(ViewerMoment);
