package odette

func (c *char) danceDoubleTicker(src int, attackType danceDoubleAttackType) {
	if c.danceDoubleSrc != src {
		return
	}

	if !c.StatusIsActive(danceDoubleKey) {
		return
	}

	ai := info.AttackInfo{
		ActorIndex: c.Index(),
		AttackTag:  attacks.AttackTagElementalArt,
		ICDTag:     attacks.ICDTagNone,
		ICDGroup:   attacks.ICDGroupDefault,
		StrikeType: attacks.StrikeTypeDefault,
		Element:    attributes.Cryo,
		Durability: 25,
	}

	var offset info.Point
	if attackType == danceDoublePlume {
		ai.Abil = "\"Plume\" Dance Move"
		ai.Mult = plume[c.TalentLvlSkill()]
	} else {
		ai.Abil = "\"Wing\" Dance Move"
		ai.Mult = wing[c.TalentLvlSkill()]
		offset = info.Point{Y: 1}
	}

	ap := combat.NewCircleHitOnTarget(c.Core.Combat.PrimaryTarget(), offset, 4)

	c.Core.QueueAttack(ai, ap, 0, 0)
	nextAttack := danceDoubleAttackType((int(attackType) + 1) % 2)
	c.danceDoubleNextAtk = nextAttack
	c.Core.Tasks.Add(func() { c.danceDoubleTicker(src, nextAttack) }, skillTickDelay[int(attackType)])
}
