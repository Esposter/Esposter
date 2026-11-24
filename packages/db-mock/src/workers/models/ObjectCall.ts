// Every RPC an object was sent, in send order, with the object it was sent to. The object exists only inside the
// Realtime worker, so a suite asserts what the job asked of it, and what the job did with the answer
export interface ObjectCall {
  args: unknown[];
  method: string;
  objectId: string;
}
