## 1. Announce

- [ ] 1.1 Confirm the removal date 2026-12-15 with the user (proposal's dated plan) — verify the date appears in the README and the announcement.
- [ ] 1.2 Post the announcement and the report request to the team — verify the README release note names both dates.

## 2. Remove (on the removal date)

- [ ] 2.1 Remove the two alias entries from `.claude-plugin/marketplace.json` and their notes — verify `claude plugin validate` for the three plugins passes.
- [ ] 2.2 Replace the pre-v3 migration in `Deploy-ClaudeConfig.ps1` with the leftover report, and remove alias lines from `Show-ClaudeConfigStatus` — verify the two `deploy-migration` scenarios in a scratch home directory.
- [ ] 2.3 Replace Verify-Config section 3e with the leftover-report vectors and update section 4's alias checks — verify Verify-Config GREEN.

## 3. Close-out

- [ ] 3.1 Update the README (deprecated-alias paragraph and release note) — verify no README path is an alias name.
- [ ] 3.2 Run `openspec validate retire-legacy-install-paths --strict --no-interactive` — verify exit 0.
