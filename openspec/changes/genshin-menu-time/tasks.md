## 1. Rule

- [x] 1.1 Build the target-minute rule that clamps the advance and wraps past midnight. Verify: `getTimeTargetMinutes.test.ts` asserts the scenarios 'An advance under thirty minutes lands thirty minutes on', 'An advance beyond two days stops at two days' and 'An advance past midnight wraps onto the next day's hours', written first and seen failing.
- [x] 1.2 Clip the English PC client's Time screen from the public recording and name its reference frame in the parity reference map. Verify: `pnpm -C scripts recreation clip --directory ~/Esposter/genshin-parity/captures https://www.youtube.com/watch?v=a4_J84iMqR0 --from 0 --to 60 --name time` writes the clip, and the `menu-time` entry names its capture and second.

## 2. Screen

- [x] 2.1 Draw the Time screen's dial, its hour and its Confirm button in the reference's pixels, with their labels as game-text keys, and let a dragged pointer add its turns to the advance. Verify: a test named after the scenario 'A full turn of the dial adds a day', written first and seen failing.

## 3. Wiring

- [x] 3.1 Expose the world's clock from the Windrise component and fill the menu's Time slot with the screen, setting the clock on confirm and closing back to the world. Verify: tests named after the scenarios 'Confirm sets the clock to the target' and 'Closing without confirming leaves the clock as it was', written first and seen failing.

## 4. Check

- [ ] 4.1 Compare the Time screen's fixture with its reference. Verify: `pnpm -C scripts genshin:parity compare menu-time` writes its row, queued for the user's eyes.
