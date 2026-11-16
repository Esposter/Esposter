## Purpose

A server-rendered page hydrates with no mismatch: the client's first render reads only what the server rendered from, and every deploy proves it on every page the sitemap lists.

## Requirements

### Requirement: Every deployed page hydrates without a mismatch

Every page the deployed sitemap lists SHALL hydrate in a browser at a desktop and a phone size without Vue reporting a hydration mismatch, and the deploy SHALL fail when one does.

#### Scenario: A page whose client render differs from its server render

- **GIVEN** a deployed page whose first client render differs from the server's HTML
- **WHEN** the hydration check loads it after the deploy
- **THEN** the check fails naming the page and the size

#### Scenario: A page that never finishes hydrating

- **GIVEN** a deployed page whose hydration never completes
- **WHEN** the hydration check loads it
- **THEN** the check fails naming the page and the size

#### Scenario: Every page hydrates cleanly

- **GIVEN** a deploy whose every sitemap page hydrates with no mismatch at both sizes
- **WHEN** the hydration check runs
- **THEN** it passes
