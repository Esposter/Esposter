# Tasks

## 1. Nothing names the old registrar

- [x] 1.1 Remove the old registrar from the README, the README logo sources and the logo asset. Verify: `git grep -il namecheap -- ":!openspec/changes/archive" ":!openspec/changes/infra-cloudflare-registrar"` prints nothing.

## 2. After the transfer

- [x] 2.1 The owner confirms the transfer completed. Verify: the domain's RDAP record at `https://rdap.org/domain/esposter.com` names Cloudflare as registrar and an expiry one year past the old one.
- [x] 2.2 The account's admin roles are kept to those who need one, and the deploy token carries no registrar permission. Verify: the account members API lists one member, the owner, as Super Administrator, and the deploy token is answered `Authentication error` by the registrar domains API.
- [x] 2.3 Declare the zone's DNSSEC in `zoneDnssecs/esposterComDnssec.ts`. Verify: `pnpm infra:preview --suppress-outputs` lists one create and nothing else, and after `pnpm infra:up` a DNSKEY lookup for `esposter.com` returns keys.
- [x] 2.4 Declare the no-mail baseline in `dnsRecords/esposterComNullMx.ts`, `esposterComSpf.ts` and `esposterComDmarc.ts`. Verify: the preview lists three creates and nothing else, and after the apply `Resolve-DnsName esposter.com -Type MX` returns the null MX and the TXT lookups return the SPF and DMARC values.
- [x] 2.5 Cloudflare publishes the zone's DS record at the registry. Verify: a DS lookup for `esposter.com` returns a record, and the domain's RDAP record reads `delegationSigned: true`, within two days of 2.3's apply. Done: the DS lookup returns a record, and RDAP reads `delegationSigned: true`.

## 3. The specs and docs carry it

- [x] 3.1 Add the posture rows for the registration, expiry warnings and the account's sign-in to the cost and security posture page, and name the registrar in the infra README's opening. Verify: `pnpm -C scripts exec vitest run src/workspace` passes.
- [x] 3.2 Add the DNSSEC resource type's folder to the naming conventions page. Verify: the same run passes.

## 4. The no-mail records' logical names

- [x] 4.1 Decide the logical names of the no-mail records. They keep the shape of the zone's other children that serve no hostname, `<zone>-<what it is>`, beside `esposter.com-redirects` and `esposter.com-dnssec`, and the naming conventions page states the rule. Verify: `pnpm infra:preview --suppress-outputs` lists no change.
