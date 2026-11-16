# Cloudflare registrar

## Why

`esposter.com` is registered at Cloudflare, so the domain, its DNS, its certificates and the Workers it serves are one account's. The transfer itself is the owner's, in the dashboard. What the repository owes is that nothing still describes the old arrangement, that what Cloudflare now lets the program declare about the domain is declared, and that what stays outside the program is written down, so a gap is a recorded decision and never an oversight.

## What changes

- The README, the README logo sources and the logo asset stop naming the old registrar. This is done.
- Once the transfer completes, the program declares the zone's DNSSEC, and a no-mail baseline for a domain that sends no mail: a null MX, an SPF record that authorises no sender, and a DMARC record that rejects.
- The cost and security posture page gains the rows for what stays outside the program: the registration and its renewal and expiry warnings, and the account's sign-in, where no two-factor enforcement is declared.

## Capabilities

None. The change is infrastructure and documentation, so it carries no spec delta. Its decisions land in the posture page.

## Waiting on

The transfer completing. Cloudflare's transfer guide gives its total time as up to ten days, depending on the old registrar, and every program change here is gated on the registrar of record being Cloudflare.

## Impact

Adds a few small Pulumi resources and a folder for the DNSSEC resource's type. No Worker, table or queue changes.
