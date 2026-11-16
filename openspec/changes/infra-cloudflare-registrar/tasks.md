# Tasks

## 1. Nothing names the old registrar

- [x] 1.1 Remove the old registrar from the README, the README logo sources and the logo asset. Verify: `git grep -il namecheap -- ":!openspec/changes/archive" ":!openspec/changes/infra-cloudflare-registrar"` prints nothing.

## 2. After the transfer

- [ ] 2.1 The owner confirms the transfer completed. Verify: the domain's RDAP record at `https://rdap.org/domain/esposter.com` names Cloudflare as registrar and an expiry one year past the old one.
- [ ] 2.2 The owner keeps admin roles to those who need one and checks that the deploy token carries no registrar permission. Verify: the owner reads each setting back in the dashboard.
- [ ] 2.3 Declare the zone's DNSSEC in `zoneDnssecs/esposterComDnssec.ts`. Verify: `pnpm infra:preview --suppress-outputs` lists one create and nothing else, and after `pnpm infra:up` a DNSKEY lookup for `esposter.com` returns keys and the parent zone holds a DS within two days.
- [ ] 2.4 Declare the no-mail baseline in `dnsRecords/esposterComNullMx.ts`, `esposterComSpf.ts` and `esposterComDmarc.ts`. Verify: the preview lists three creates and nothing else, and after the apply `Resolve-DnsName esposter.com -Type MX` returns the null MX and the TXT lookups return the SPF and DMARC values.

## 3. The specs and docs carry it

- [ ] 3.1 Add the posture rows for the registration, expiry warnings and the account's sign-in to the cost and security posture page, and name the registrar in the infra README's opening. Verify: `pnpm -C scripts exec vitest run src/workspace` passes.
- [ ] 3.2 Add the DNSSEC resource type's folder to the naming conventions page. Verify: the same run passes.
