// A `Tasks.Add`, `QueueCharTask` or `QueueEnemyTask` closure's body and the delay written after its closing brace. The
// Task runs its body that delay after the action, so a queue call in the body is delayed by it as well
export interface TaskClosure {
  bodyEnd: number;
  bodyStart: number;
  delayStart: number;
}
