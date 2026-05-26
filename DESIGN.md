# Jones in the Fast Lane — Nútímavæð útgáfa
## Hönnunarskjal v0.1

---

## 1. Hugmyndafræði

Leikurinn er innblásinn af Jones in the Fast Lane (Sierra, 1990) en er nútímavæður og sjálfstæður leikur. Við geymum kjarnahugmyndina — þú keppist við aðra um að ná markmiðum í lífi — en útfærum hana með dýpri mekaník og nútímalegri framkvæmd.

Leikurinn speglar raunverulegt líf: tími er takmarkaður, ákvarðanir hafa afleiðingar, og oft þarf maður að fórna einu til að fá annað.

---

## 2. Kjarnaþættirnir — Life Stats

Hver leikmaður hefur 6 sýnilegar stats (0–100) og 1 falda stat:

| Stat | Íslenska | Lykill | Lýsing |
|------|----------|--------|---------|
| 💰 Wealth | Auður | `wealth` | Peningar, eignir, fjárhagsleg öryggi |
| 🎓 Knowledge | Þekking | `knowledge` | Menntun, hæfni, tækni |
| 💼 Career | Ferill | `career` | Starfsframgangur, sérfræðiþekking |
| ❤️ Wellbeing | Líðan | `wellbeing` | Hamingja, heilsa, líkamleg og andleg |
| 🤝 Network | Tengsl | `network` | Vináttan, sambönd, connections |
| ⭐ Reputation | Orðspor | `reputation` | Social status, áhrif, traust |
| 🍀 Luck | Heppni | `luck` | Falið — hefur áhrif á random events |

### Samspil stats

```
knowledge + career  → hærri laun, betri stöður
network             → opnar dyr sem peningar gera ekki
reputation          → breytir verðlagi og aðgengi
low wellbeing       → dregur úr öllum öðrum stats
wealth - reputation → "new money" vandinn
luck (hidden)       → litast á niðurstöður allra aðgerða
```

### Streita (Stress) — Neikvæð mekaník

Streita byggist upp í bakgrunni og hefur neikvæð áhrif:

```
Streita 0–30:   Engin áhrif
Streita 31–60:  Líðan -1/viku, minni skilvirkni
Streita 61–80:  Hætta á negative events
Streita 81–100: Burnout — forced rest, töp í öllum stats
```

Streita lækkar með: hvíld, hobby, félagslíf, frítíma.
Streita hækkar með: of mikil vinna, fjárhagsleg vandræði, slæm tengsl.

---

## 3. Tími — Grunnmekaník

Hvert "ár" í leiknum samanstendur af **52 vikum**. Hver vika gefur **10 tímaeiningar (TE)**.

| Athöfn | TE | Áhrif |
|--------|-----|-------|
| Vinna (full vika) | 6 | +career, +wealth |
| Part-time vinna | 3 | +wealth (minna) |
| Skóli / námskeið | 4 | +knowledge |
| Hobby | 2 | +wellbeing, hugsanlegt tækifæri |
| Félagslíf | 2 | +network, +wellbeing |
| Hvíld | 1 | -stress, +wellbeing |
| Líkamsrækt | 1 | +wellbeing, -stress |

Ef leikmaður notar meira en 10 TE á viku → streita hækkar.

---

## 4. Hobby & Talent kerfi

### Hobby

Hobbyar eru hlutir sem leikmaður eignast og þróar í gegnum tíma:

```typescript
interface Hobby {
  id: string
  name: string
  level: 'beginner' | 'skilled' | 'talented' | 'professional'
  xp: number
  weeklyTimeCost: number       // TE á viku
  wellbeingBonus: number
  opportunities: Opportunity[] // opnast á ákveðnum levels
}
```

**Dæmi um hobbyar:**
- 🎵 Tónlist → gig → plötusamnignur
- 🎨 Myndlist → sýning → gallerí
- 💻 Forritun → app → startup
- 🏋️ Íþrótt → keppni → þjálfari/influencer
- ✍️ Skrif → blog → bók
- 🍳 Matreiðsla → pop-up → veitingahús
- 📷 Ljósmyndun → freelance → studio

### Talent

Talent er meðfædd gáfa — dreginn upp í byrjun leiks (heppni-driven):

```typescript
interface Talent {
  hobbyId: string    // Gefur head-start í ákveðnum hobby
  bonus: number      // XP multiplier (1.5x – 2x)
}
```

---

## 5. Group Activities

Þegar fleiri en 1 leikmaður er í leik geta þeir stofnað hópa.

```typescript
interface GroupActivity {
  id: string
  type: GroupActivityType
  members: PlayerId[]
  level: number                // 0–5, hækkar með tíma og commitment
  commitmentRequired: number   // % commitment sem þarf
  memberCommitment: Record<PlayerId, number>
}
```

**Hópar og kröfur:**

| Hópur | Meðlimir | Kröfur | Tækifæri |
|-------|----------|--------|----------|
| 🎸 Hljómsveit | 2–4 | Tónlist hobby | Tónleikaleif → plötusamnignur |
| 🏀 Körfubolti | 2–6 | Líkamleg líðan ok | Deild → meistarar |
| ♟️ Bridge/Poker | 2–4 | Engar | Veginningar, network |
| 💼 Startup | 2–3 | Knowledge 50+ | Stórt Auður tækifæri |
| 🎨 Listahópur | 2–4 | Listaleg hobby | Sýning → faglegt viðurkenning |
| 🏃 Hlaupahópur | 2–6 | Engar | Heilsa, network |
| 📚 Bókaklubbur | 2–8 | Engar | Knowledge, network |

### Group Dynamics

- **Commitment** — ef meðlimur er ekki nógu committed dregur hópur saman
- **Ego clash** — þegar tveir meðlimir vilja báðir leiðtogahlutverkið
- **Democratic decisions** — á ákveðnum tímamótum þarf hópurinn að kjósa um stefnu
- **Breakup** — hópur getur brotið upp, sem skaðar Tengsl milli viðkomandi

---

## 6. Heppni kerfi

Heppni er **hidden stat** (0–100) með luck pool sem sveiflast:

```
Heppni hækkar:
  + Góðar ákvarðanir (þegar outcome er jákvæður)
  + Há Líðan
  + Góð Tengsl
  + Random events (sjaldgæfar "windfall" events)

Heppni lækkar:
  + Slæmar ákvarðanir
  + Lág Líðan
  + Negative events
```

Heppni hefur áhrif á **líkur** — ekki niðurstöður beint:
- Lág heppni → meiri líkur á negative events
- Há heppni → meiri líkur á positive opportunities
- Aldrei 0% eða 100% líkur á neinu

---

## 7. Random Events

Events koma upp á ákveðnum tímum (oft á milli vikna):

```typescript
interface GameEvent {
  id: string
  trigger: EventTrigger       // stat threshold, random, time-based
  choices: EventChoice[]      // leikmaður velur
  probability: number         // base probability, modified by luck
}
```

**Dæmi:**

| Event | Trigger | Choices |
|-------|---------|---------|
| 🎰 Lottó vinnst | Random (lág líkur) | Taka | Fjárfesta aftur |
| 🚗 Bíll bilar | Random + lág heppni | Borga viðgerð | Selja bílinn |
| 📞 Job offer | Network 60+ + heppni | Samþykkja | Hafna |
| 🤒 Veikindi | Lág Líðan + heppni | Hvílast | Vinna samt |
| 💡 Breakthrough | Knowledge 70+ + hobby | Þróa hugmynd | Hunsa |
| 🏆 Viðurkenning | Career 80+ | Þiggja | Hafna |

---

## 8. Markmið kerfi

Í byrjun leiks velur **hvert player** sín eigin markmið (2–4 af lista):

```typescript
interface Goal {
  id: string
  name: string
  condition: (player: PlayerState) => boolean
  points: number
}
```

**Dæmi um markmið:**
- 💰 "Millionær" — Auður ≥ 90
- 🎓 "Sérfræðingur" — Þekking ≥ 85 + Career ≥ 70
- ❤️ "Sátt við lífið" — Líðan ≥ 80 + Streita ≤ 20
- 🌟 "Þekktur einstaklingur" — Orðspor ≥ 85
- 🤝 "Tenglavefur" — Network ≥ 80 + 5+ active contacts
- 🎸 "Listamaður" — Hobby á Professional level

---

## 9. Spilamátar

### Single-player vs AI Jones
- Jones er AI keppinautur með stillanleg erfiðleikastig
- Jones gerir "smart" ákvarðanir byggt á markmiðum sínum
- Erfiðleikastig stjórnar hve oft Jones hefur "gæfu"

### Local Multiplayer
- 2–4 leikmenn á sama tæki
- Hot-seat: hvert player í sinni röð

### Online Multiplayer
- 2–4 leikmenn í rauntíma yfir WebSocket
- Private rooms með kóða
- Sync turns yfir Socket.io

---

## 10. Tæknileg uppbygging

```
jones-web/
├── shared/                    # Týpur og game logic (client + server)
│   └── src/
│       ├── types/
│       │   ├── player.ts      # PlayerState, Stats, Goals
│       │   ├── game.ts        # GameState, GameConfig
│       │   ├── board.ts       # BoardLocation, LocationType
│       │   ├── hobby.ts       # Hobby, Talent, GroupActivity
│       │   └── events.ts      # GameEvent, EventChoice
│       ├── engine/
│       │   ├── gameEngine.ts  # Kjarnalogic, turns, actions
│       │   ├── statEngine.ts  # Útreikningur á stat changes
│       │   ├── eventEngine.ts # Random events, triggers
│       │   └── aiEngine.ts    # Jones AI logic
│       └── index.ts
│
├── client/                    # React + TypeScript frontend
│   └── src/
│       ├── components/
│       │   ├── Board/         # Leikjaborðið
│       │   ├── Player/        # Player card, stats
│       │   ├── HUD/           # Stats display, time
│       │   ├── Events/        # Event dialogs
│       │   └── Lobby/         # Game setup
│       ├── store/
│       │   └── gameStore.ts   # Zustand state
│       ├── hooks/
│       │   ├── useGame.ts
│       │   └── useSocket.ts
│       └── App.tsx
│
└── server/                    # Node.js + Socket.io
    └── src/
        ├── rooms.ts           # Room management
        ├── gameServer.ts      # Server-side game sync
        └── index.ts
```

### Tech Stack

| Hluti | Tækni |
|-------|-------|
| Frontend | Vite + React 18 + TypeScript |
| State | Zustand |
| Realtime | Socket.io (client + server) |
| Styling | Tailwind CSS v4 |
| Backend | Node.js + Express + Socket.io |
| Shared | Pure TypeScript (no framework) |

---

## 11. Þróunarferlið (MVP milestones)

### M1 — Core types og game engine
- [ ] Shared týpur (Player, Stats, Game, Board)
- [ ] Game engine (turns, actions, stat changes)
- [ ] Basic AI (Jones)

### M2 — Frontend grunnur
- [ ] Leikjaborð (board component)
- [ ] Player HUD (stats, tími)
- [ ] Turn system UI

### M3 — Single-player leikur
- [ ] Full single-player loop vs Jones AI
- [ ] Events system
- [ ] Goals og ending

### M4 — Hobby & Groups
- [ ] Hobby kerfi
- [ ] Group activities (local multiplayer)

### M5 — Online multiplayer
- [ ] Socket.io server
- [ ] Room system
- [ ] Synced game state

---

*Skjal útbúið: 2026-05-26*
*Útgáfa: 0.1 — Upphafsdrög*
