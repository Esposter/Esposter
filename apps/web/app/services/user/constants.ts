// One mutation key per target the account pages write, so the writes to each queue behind one another rather
// Than racing: two unlinks in flight together would both pass better-auth's last-account guard, two revokes
// Would both read a listing the other has already changed, and a second profile save should be the one that lands.
export const LINKED_ACCOUNTS_MUTATION_KEY = "linkedAccounts";

export const PROFILE_MUTATION_KEY = "profile";

export const SESSIONS_MUTATION_KEY = "sessions";
