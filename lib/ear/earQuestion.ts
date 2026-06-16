import { Chord, Level, qualityPool, randomChord, TIERS } from "@/lib/theory/chordPool";
import { Tonality } from "@/lib/theory/keyHarmony";
import { KEYS } from "@/lib/theory/transpose";
import { QUALITIES, QualityId } from "@/lib/theory/qualities";

export type EarMode = "quality" | "function" | "degree";

export type EarQuestion = {
	target: Chord;
	options: Chord[];
	labels: string[];
	correctIndex: number;
};

export function shuffle<T>(items: T[]): T[] {
	const a = [...items];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

/**
 * Build an ear-training question: a target chord plus up to 3 distinct
 * distractors from the same pool. Generated at concert pitch so the spoken
 * label matches the sound. Function mode (key only) labels by Roman numeral.
 */
export function makeQuestion(settings: {
	level: Level;
	keyChoice: string | "all";
	tonality: Tonality;
	mode: EarMode;
}): EarQuestion {
	const useFunction = settings.mode === "function" && settings.keyChoice !== "all";
	const labelOf = (c: Chord) => (useFunction ? (c.roman ?? c.symbol) : c.symbol);

	const target = randomChord(settings.level, settings.keyChoice, settings.tonality, "C");
	const chosen: Chord[] = [target];
	const seen = new Set([labelOf(target)]);
	for (let guard = 0; guard < 60 && chosen.length < 4; guard++) {
		const c = randomChord(settings.level, settings.keyChoice, settings.tonality, "C");
		const label = labelOf(c);
		if (!seen.has(label)) {
			seen.add(label);
			chosen.push(c);
		}
	}
	const options = shuffle(chosen);
	return {
		target,
		options,
		labels: options.map(labelOf),
		correctIndex: options.indexOf(target),
	};
}

export type QualityQuestion = {
	/** Concert-pitch root, shared by every option. */
	root: string;
	target: QualityId;
	options: QualityId[];
	labels: string[];
	correctIndex: number;
};

/**
 * Build a chord-QUALITY question: one root, identify the quality (Major, Minor,
 * Half-dim, …). All options share the root so only the colour differs.
 */
export function makeQualityQuestion(settings: { level: Level }): QualityQuestion {
	const root = KEYS[Math.floor(Math.random() * KEYS.length)];
	const pool = qualityPool(settings.level);
	const fromTier = settings.level > 1 && Math.random() < 0.6;
	const target = (fromTier ? TIERS[settings.level].qualities : pool)[
		Math.floor(Math.random() * (fromTier ? TIERS[settings.level].qualities.length : pool.length))
	];

	const chosen: QualityId[] = [target];
	for (const q of shuffle(pool)) {
		if (chosen.length >= 4) break;
		if (!chosen.includes(q)) chosen.push(q);
	}
	const options = shuffle(chosen);
	return {
		root,
		target,
		options,
		labels: options.map((q) => QUALITIES[q].name),
		correctIndex: options.indexOf(target),
	};
}
