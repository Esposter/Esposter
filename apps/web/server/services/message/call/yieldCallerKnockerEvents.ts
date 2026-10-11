// The events a call raises for one knocker, yielded as a bare tick for each one that names this call and the caller:
// A knocker is only told that its own request was answered, never another knocker's
export const yieldCallerKnockerEvents = async function* (
  events: AsyncIterable<[{ callSessionId: string; knockerSessionId: string }]>,
  callSessionId: string,
  callerSessionId: string,
) {
  for await (const [{ callSessionId: eventCallSessionId, knockerSessionId }] of events) {
    if (eventCallSessionId !== callSessionId || knockerSessionId !== callerSessionId) continue;
    yield undefined;
  }
};
