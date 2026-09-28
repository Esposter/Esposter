// Why the host closed a connection before it could send commands, in the range WebSocket leaves to applications
export enum HostCloseCode {
  // A first message that is no handshake, or a file of the host's that could not be read to answer it
  HandshakeRefused = 4400,
  // The credential is unknown — never paired here, or revoked — so the page forgets it rather than retrying
  CredentialRefused = 4401,
  // A pairing from a foreign origin, or with a code that is unknown, used or expired
  PairingRefused = 4403,
  // A hand-off or revoke whose signature is not the host's own key's
  SignatureRefused = 4404,
}
