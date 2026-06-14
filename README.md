# Improv Practice Tool

A web tool for musicians practicing improvisation. It flashes chords to blow over in
time with a built-in metronome, with difficulty tiers and common jazz patterns.

## Features

- **Chord drill** — random chords flash on the beat. Four difficulty tiers that stack up:
  triads → 7th chords → extensions (9/11/13) → altered dominants. Lock to one key or draw
  from all 12. A difficulty-gated "next chord" preview helps on easy levels and hides on hard ones.
- **Pattern practice** — transposable jazz progressions (ii–V–I, turnarounds, blues, rhythm
  changes, tritone subs, backdoor ii–V, modal interchange, Bird blues, Giant Steps, …), grouped
  by difficulty. Loop in one key, **cycle keys** by fourths or at random each rep, and **ramp the
  tempo** every repetition.
- **Metronome** — accurate scheduling on `Tone.Transport`, adjustable tempo, time signatures
  (4/4, 3/4, 2/4, 6/8), accented downbeat, visual beat indicator, optional count-in.
- **Voiced chord audio** (optional) — hear each chord, not just see it.
- **Instrument transposition** — read chords in concert pitch or for B♭ / E♭ / F instruments.
- Settings persist in your browser; no account needed.

## Tech

- Next.js (App Router) + TypeScript + Tailwind CSS
- [Tonal.js](https://github.com/tonaljs/tonal) — chord/scale theory and transposition
- [Tone.js](https://github.com/Tonejs/Tone.js) — audio clock, metronome, and chord synth

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # vitest — theory engine unit tests
npm run lint
npm run typecheck
npm run build
```

The music-theory engine lives in `lib/theory/` (pure functions, unit-tested). Audio is in
`lib/audio/`, the drill/pattern schedulers in `lib/drill/` and `lib/pattern/`, and UI in
`components/`.

## Deploy

Zero-config on [Vercel](https://vercel.com): import the GitHub repo and deploy. The app is fully
client-side (static), so there is no server runtime cost.
