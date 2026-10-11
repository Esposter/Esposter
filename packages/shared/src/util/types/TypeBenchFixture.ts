// The deep shape the type benches measure: four levels of objects, arrays, optional and nullable fields, and a Date
export interface TypeBenchFixture {
  createdAt: Date;
  id: string;
  members: {
    id: string;
    joinedAt?: Date;
    profile: { avatarUrl?: string | null; displayName: string; links: { label: string; url: string | null }[] };
    role: { name: string; permissions: string[] } | null;
  }[];
  owner: { id: string; profile: { displayName: string; links: { label: string; url: string }[] } };
  tags?: string[] | null;
}
