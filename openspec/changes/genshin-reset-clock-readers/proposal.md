# Reset clock readers

## Why

The reset clock left two readers on their own clocks. The enemies' respawn check timed its defeats, jumps and claims on the device's clock, so a respawn was checked against the machine's time rather than the server's. The domains' opening checks took a date from the caller, so each caller chose the day in its own zone, which is the drift the reset clock removed. The domain screen being built calls those checks, so the day should come from the clock they are given.

## What Changes

- The enemies time their defeats, jumps and Trounce Blossom claims on the world clock, and check each defeated camp member's respawn against it. Windrise forwards the world clock from Session to the enemies.
- The domains' opening checks take the moment checked, and read its game day from the reset clock. A moment before the daily reset keeps the previous game day's opening.

## Capabilities

- **genshin/reset-clock** (added requirements): the respawn check and the domains' game day read the world clock.

## Impact

- The Windrise, Enemies and Session components, which carry the world clock to the enemies.
- The enemy and domain services the components and the domain screen call.
- The domains design and the save-data and enemies pages, which described the device clock or a caller's day.
