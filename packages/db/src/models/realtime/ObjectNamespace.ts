// The calling Worker's binding of a Durable Object class, as much of it as a call reads: the stub a name resolves to,
// And The name's id. Structural, for the same reason as TopicNamespace
export interface ObjectNamespace<TStub, TId> {
  get: (id: TId) => TStub;
  idFromName: (name: string) => TId;
}
