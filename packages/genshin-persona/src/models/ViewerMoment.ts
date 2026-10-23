// The moments the terminal reaches the model at: a permission, a question or an idle prompt wants the person, and a
// Turn is over. The motion map is keyed by these, so the verb and both hooks name them the same way
export const ViewerMoment = { Attention: "attention", TurnEnd: "turnEnd" } as const;

export type ViewerMoment = (typeof ViewerMoment)[keyof typeof ViewerMoment];

export const ViewerMoments: readonly ViewerMoment[] = Object.values(ViewerMoment);
