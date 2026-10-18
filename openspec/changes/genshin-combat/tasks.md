## 1. Glimmer formula

- [x] 1.1 Weight the four highest contributors of a Glimmer reaction at 0.6, 0.3, 0.05 and 0.05. Verify: tests named after the scenarios 'a Glimmer reaction weights its four highest contributors' and 'a Glimmer reaction with a lower contributor is not counted', seen failing first.

## 2. Stellar reactions

- [ ] 2.1 Turn a Cryo Swirl into Stellar Swirl while the party's Stellar Swirl enabler is held. Verify: in `services/combat/aura/applyElement.test.ts`, tests named after the scenarios 'a Cryo Swirl starts Stellar Swirl while the party enables it', 'a Cryo Swirl stays an ordinary Swirl without the enabler' and 'a Stellar Swirl spreads no Cryo beside it', seen failing first.
- [ ] 2.2 Turn a Superconduct into Stellar-Conduct while the party's Stellar-Conduct enabler is held. Verify: in `services/combat/aura/applyElement.test.ts`, tests named after the scenarios 'a Superconduct becomes Stellar-Conduct while the party enables it' and 'no Stellar-Conduct occurs without the enabler', seen failing first.
- [ ] 2.3 Set the enablers from the Stellar Jubilee passives of the kits that carry them, once the first kit is built (Odette's module, or the Cryo Traveler's kit once it has a Cryo variant). Verify: in the test file of the kit that carries it, a test named after the scenario 'a Stellar Jubilee passive enables both reactions for its party', seen failing first.
- [ ] 2.4 Place the Polestar Field and the Stellar Vortex the reactions create, with their effects, once a kit uses them. Verify: a test named after the Polestar Field's scenario, added to this change's spec before the field is built, seen failing first.
