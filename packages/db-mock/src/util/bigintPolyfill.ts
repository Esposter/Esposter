// Postgres returns bigint columns as strings that drizzle hands back as BigInt, which JSON.stringify refuses to
// Serialize — so the mock db teaches BigInt how, exactly as the app's own serializer does.
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/3609
//
// Object.assign is what makes this honest: JSON.stringify looks toJSON up at runtime, so nothing needs to claim
// Statically that every BigInt has one — a global interface augmentation would leak that lie to every consumer.
Object.assign(BigInt.prototype, {
  toJSON(this: bigint): string {
    return this.toString();
  },
});
