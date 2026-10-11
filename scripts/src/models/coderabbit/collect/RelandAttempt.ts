// One held commit's re-land, picked onto the queue's head and committed but not pushed
export interface RelandAttempt {
  // What went wrong, when the pick could not be settled; the tree is back on the queue's head then
  failure?: string;
  // Whether the resolver's session ran, which a run spends on one held commit at most
  isSessionRun: boolean;
}
