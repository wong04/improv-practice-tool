import { formatChord, QualityId } from "./qualities";
import { KEYS, Instrument, transposeForInstrument } from "./transpose";

export type Level = 1 | 2 | 3 | 4;

export type DifficultyTier = {
	level: Level;
	name: string;
	description: string;
	/** Chord qualities introduced at this tier. */
	qualities: QualityId[];
};

export const TIERS: Record<Level, DifficultyTier> = {
	1: {
		level: 1,
		name: "Triads",
		description: "Major, minor, diminished, augmented",
		qualities: ["maj", "min", "dim", "aug"],
	},
	2: {
		level: 2,
		name: "7th chords",
		description: "maj7, m7, dominant 7, m7♭5, dim7, 6, m6",
		qualities: ["maj7", "m7", "7", "m7b5", "dim7", "6", "m6"],
	},
	3: {
		level: 3,
		name: "Extensions",
		description: "9ths, 11ths, 13ths, 6/9, sus",
		qualities: ["9", "maj9", "m9", "11", "13", "69", "sus4"],
	},
	4: {
		level: 4,
		name: "Alterations",
		description: "Altered dominants (♭9, ♯9, ♯11, ♭13, alt)",
		qualities: ["7b9", "7#9", "7#11", "7b13", "7alt"],
	},
};

/**
 * The pool of qualities available at a level. Levels are cumulative: level 3
 * includes everything from levels 1–3 so easier chords keep appearing.
 */
export function qualityPool(level: Level): QualityId[] {
	const pool: QualityId[] = [];
	for (let l = 1 as Level; l <= level; l = (l + 1) as Level) {
		pool.push(...TIERS[l].qualities);
	}
	return pool;
}

export type Chord = { root: string; quality: QualityId; symbol: string };

/** Probability that a draw comes from the selected tier rather than the whole pool. */
const TIER_BIAS = 0.6;

function pick<T>(items: readonly T[], rng: () => number): T {
	return items[Math.floor(rng() * items.length)];
}

/**
 * Generate a random chord for the drill. The selected tier's own qualities are
 * favoured (so e.g. "Alterations" mostly shows altered chords) while easier
 * qualities from lower tiers still surface.
 * @param keyChoice a specific key from KEYS, or "all" to draw a random root.
 */
export function randomChord(
	level: Level,
	keyChoice: string | "all",
	instrument: Instrument = "C",
	rng: () => number = Math.random,
): Chord {
	const fromTier = level > 1 && rng() < TIER_BIAS;
	const quality = pick(fromTier ? TIERS[level].qualities : qualityPool(level), rng);
	const concertRoot = keyChoice === "all" ? pick(KEYS, rng) : keyChoice;
	const root = transposeForInstrument(concertRoot, instrument);
	return { root, quality, symbol: formatChord(root, quality) };
}
