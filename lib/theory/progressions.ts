import { Degree, Progression, ProgressionChord } from "./progressionEngine";
import { QualityId } from "./qualities";
import type { Level } from "./chordPool";

/** Terse chord constructor: c(degree, quality, beats). */
function c(degree: Degree, quality: QualityId, beats: number): ProgressionChord {
	return { degree, quality, beats };
}

/**
 * Transposable jazz progression catalog, tiered by difficulty (level 1–4).
 * Templates are roman-numeral relative to the tonic; expandProgression() spells
 * them in any concert key. Concrete keys cited below are the defaultTonic.
 */
export const PROGRESSIONS: Progression[] = [
	// ---- Level 1: diatonic cadences & turnarounds ----
	{
		id: "ii-v-i-major",
		name: "ii–V–I (major)",
		level: 1,
		devices: ["ii-V", "major"],
		description: "The atomic jazz cadence. Dm7 – G7 – Cmaj7.",
		defaultTonic: "C",
		chords: [c("II", "m7", 4), c("V", "7", 4), c("I", "maj7", 4)],
	},
	{
		id: "i-vi-ii-v",
		name: "I–vi–ii–V turnaround",
		level: 1,
		devices: ["turnaround"],
		description: "The default loop-back cadence. Cmaj7 – Am7 – Dm7 – G7.",
		defaultTonic: "C",
		chords: [c("I", "maj7", 2), c("VI", "m7", 2), c("II", "m7", 2), c("V", "7", 2)],
	},
	{
		id: "i-VI-ii-v",
		name: "I–VI7–ii–V (rhythm turnaround)",
		level: 1,
		devices: ["turnaround", "secondary-dominant"],
		description: "Bebop turnaround; the VI7 is a secondary dominant. C6 – A7 – Dm7 – G7.",
		defaultTonic: "C",
		chords: [c("I", "6", 2), c("VI", "7", 2), c("II", "m7", 2), c("V", "7", 2)],
	},
	{
		id: "i-vi-iv-v",
		name: "I–vi–IV–V (doo-wop)",
		level: 1,
		devices: ["turnaround", "pop"],
		description: "Ubiquitous diatonic loop. Cmaj7 – Am7 – Fmaj7 – G7.",
		defaultTonic: "C",
		chords: [c("I", "maj7", 4), c("VI", "m7", 4), c("IV", "maj7", 4), c("V", "7", 4)],
	},

	// ---- Level 2: minor ii–V, blues, rhythm changes ----
	{
		id: "ii-v-i-minor",
		name: "ii–V–i (minor)",
		level: 2,
		devices: ["ii-V", "minor"],
		description: "Minor cadence with half-diminished ii and altered V. Dm7♭5 – G7♭9 – Cm6.",
		defaultTonic: "C",
		chords: [c("II", "m7b5", 4), c("V", "7b9", 4), c("I", "m6", 4)],
	},
	{
		id: "jazz-blues",
		name: "Jazz blues (12-bar)",
		level: 2,
		devices: ["blues"],
		description: "The all-dominant jazz-blues backbone with a turnaround. In F.",
		defaultTonic: "F",
		chords: [
			c("I", "7", 4),
			c("IV", "7", 4),
			c("I", "7", 4),
			c("I", "7", 4),
			c("IV", "7", 4),
			c("IV", "7", 4),
			c("I", "7", 4),
			c("VI", "7", 4),
			c("II", "m7", 4),
			c("V", "7", 4),
			c("I", "7", 2),
			c("VI", "7", 2),
			c("II", "m7", 2),
			c("V", "7", 2),
		],
	},
	{
		id: "rhythm-changes-a",
		name: "Rhythm changes — A section",
		level: 2,
		devices: ["rhythm-changes", "turnaround"],
		description: "Rapid-fire turnarounds plus V/IV. In B♭.",
		defaultTonic: "Bb",
		chords: [
			c("I", "6", 2),
			c("VI", "7", 2),
			c("II", "m7", 2),
			c("V", "7", 2),
			c("I", "6", 2),
			c("VI", "7", 2),
			c("II", "m7", 2),
			c("V", "7", 2),
			c("I", "7", 4),
			c("IV", "7", 4),
			c("III", "m7", 2),
			c("VI", "7", 2),
			c("II", "m7", 2),
			c("V", "7", 2),
		],
	},
	{
		id: "rhythm-changes-bridge",
		name: "Rhythm changes — bridge",
		level: 2,
		devices: ["rhythm-changes", "secondary-dominant"],
		description: "A descending circle of dominants. In B♭: D7 – G7 – C7 – F7.",
		defaultTonic: "Bb",
		chords: [
			c("III", "7", 4),
			c("III", "7", 4),
			c("VI", "7", 4),
			c("VI", "7", 4),
			c("II", "7", 4),
			c("II", "7", 4),
			c("V", "7", 4),
			c("V", "7", 4),
		],
	},

	// ---- Level 3: functional chromaticism ----
	{
		id: "secondary-dominant-v-of-v",
		name: "V/V – V – I",
		level: 3,
		devices: ["secondary-dominant", "ii-V"],
		description: "Secondary dominant of V tonicizes the cadence. D7 – G7 – Cmaj7.",
		defaultTonic: "C",
		chords: [c("II", "7", 4), c("V", "7", 4), c("I", "maj7", 4)],
	},
	{
		id: "extended-dominant-chain",
		name: "Extended dominant chain",
		level: 3,
		devices: ["secondary-dominant"],
		description: "Circle-of-fifths dominant cascade. E7 – A7 – D7 – G7 – Cmaj7.",
		defaultTonic: "C",
		chords: [
			c("III", "7", 4),
			c("VI", "7", 4),
			c("II", "7", 4),
			c("V", "7", 4),
			c("I", "maj7", 4),
		],
	},
	{
		id: "tritone-sub",
		name: "Tritone sub (ii–♭II7–I)",
		level: 3,
		devices: ["tritone-sub", "ii-V"],
		description: "♭II7 replaces V for chromatic bass descent. Dm7 – D♭7 – Cmaj7.",
		defaultTonic: "C",
		chords: [c("II", "m7", 4), c("bII", "7", 4), c("I", "maj7", 4)],
	},
	{
		id: "backdoor-ii-v",
		name: "Backdoor ii–V",
		level: 3,
		devices: ["backdoor", "modal-interchange"],
		description: "Resolves to I from a whole step below. Fm7 – B♭7 – Cmaj7.",
		defaultTonic: "C",
		chords: [c("IV", "m7", 4), c("bVII", "7", 4), c("I", "maj7", 4)],
	},
	{
		id: "ladybird-turnaround",
		name: "Ladybird turnaround",
		level: 3,
		devices: ["turnaround", "tritone-sub"],
		description: "Chromatic-mediant tritone-sub turnaround. Cmaj7 – E♭maj7 – A♭maj7 – D♭maj7.",
		defaultTonic: "C",
		chords: [
			c("I", "maj7", 4),
			c("bIII", "maj7", 4),
			c("bVI", "maj7", 4),
			c("bII", "maj7", 4),
		],
	},

	// ---- Level 4: non-functional / advanced ----
	{
		id: "modal-interchange",
		name: "Modal interchange showcase",
		level: 4,
		devices: ["modal-interchange"],
		description: "Borrowed chords from the parallel minor. Cmaj7 – Fm7 – B♭maj7 – A♭maj7/B♭7 – Cmaj7.",
		defaultTonic: "C",
		chords: [
			c("I", "maj7", 4),
			c("IV", "m7", 4),
			c("bVII", "maj7", 4),
			c("bVI", "maj7", 2),
			c("bVII", "7", 2),
			c("I", "maj7", 4),
		],
	},
	{
		id: "bird-blues",
		name: "Bird blues",
		level: 4,
		devices: ["blues", "bird"],
		description: "12-bar blues saturated with descending ii–Vs. In F.",
		defaultTonic: "F",
		chords: [
			c("I", "maj7", 4),
			c("VII", "m7b5", 2),
			c("III", "7b9", 2),
			c("VI", "m7", 2),
			c("II", "7", 2),
			c("V", "m7", 2),
			c("I", "7", 2),
			c("IV", "7", 4),
			c("IV", "m7", 2),
			c("bVII", "7", 2),
			c("III", "m7", 2),
			c("VI", "7", 2),
			c("bIII", "m7", 2),
			c("bVI", "7", 2),
			c("II", "m7", 4),
			c("V", "7", 4),
			c("I", "maj7", 2),
			c("VI", "m7", 2),
			c("II", "m7", 2),
			c("V", "7", 2),
		],
	},
	{
		id: "giant-steps",
		name: "Giant Steps cycle",
		level: 4,
		devices: ["coltrane", "constant-structure"],
		description: "Coltrane changes: tonal centers moving in major thirds. In B.",
		defaultTonic: "B",
		chords: [
			// A — 3-tonic cycle: B → G → Eb
			c("I", "maj7", 4),                      // Bmaj7
			c("bIII", "7", 4),                       // D7
			c("bVI", "maj7", 4),                     // Gmaj7
			c("VII", "7", 4),                        // Bb7
			c("III", "maj7", 4),                     // Ebmaj7
			c("bVII", "m7", 2), c("bIII", "7", 2),  // Am7  D7
			c("bVI", "maj7", 4),                     // Gmaj7
			c("VII", "7", 4),                        // Bb7
			// B
			c("III", "maj7", 4),                     // Ebmaj7
			c("V", "7", 4),                          // F#7
			c("I", "maj7", 4),                       // Bmaj7
			c("bV", "m7", 2), c("VII", "7", 2),      // Fm7  Bb7
			c("III", "maj7", 4),                     // Ebmaj7
			c("II", "7", 4),                         // C#7
			c("V", "maj7", 4),                       // F#maj7
			c("II", "7", 2), c("V", "7", 2),         // C#7  F#7 (turnaround)
		],
	},
	{
		id: "constant-structure",
		name: "Constant structure (minor 3rds)",
		level: 4,
		devices: ["constant-structure"],
		description: "Same quality planed by minor thirds. Cmaj7 – E♭maj7 – F♯maj7 – Amaj7.",
		defaultTonic: "C",
		chords: [
			c("I", "maj7", 4),
			c("bIII", "maj7", 4),
			c("#IV", "maj7", 4),
			c("VI", "maj7", 4),
		],
	},
];

export function progressionsByLevel(level: Level): Progression[] {
	return PROGRESSIONS.filter((p) => p.level === level);
}
