// The deep shape the type benches measure: four levels of objects, arrays, optional and nullable fields, and a Date
export interface TypeBenchFixture {
  createdAt: Date;
  id: string;
  members: {
    id: string;
    joinedAt?: Date;
    profile: { avatarUrl?: null | string; displayName: string; links: { label: string; url: null | string }[] };
    role: null | { name: string; permissions: string[] };
  }[];
  owner: { id: string; profile: { displayName: string; links: { label: string; url: string }[] } };
  tags?: null | string[];
}
