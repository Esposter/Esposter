export interface StrictTransportSecurity {
  includeSubdomains: boolean;
  // Seconds from receipt, as RFC 6797 §6.1.1 defines it
  maxAge: number;
  preload: boolean;
}
