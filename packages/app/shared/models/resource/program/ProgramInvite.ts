// The owner-side token map — the owner client already sees its own audience data, so pairing the key
// Value with its token is safe here. Only the token ever reaches a URL
export interface ProgramInvite {
  keyValue: string;
  token: string;
}
