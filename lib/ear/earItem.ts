import { Level } from "@/lib/theory/chordPool";
import { Tonality } from "@/lib/theory/keyHarmony";
import { QualityId } from "@/lib/theory/qualities";
import { chordTones } from "@/lib/theory/scales";
import { EarMode, makeQualityQuestion, makeQuestion } from "./earQuestion";
import { makeDegreeQuestion } from "./degreeQuestion";

export type { EarMode } from "./earQuestion";

export type EarSettingsInput = {
	mode: EarMode;
	level: Level;
	keyChoice: string | "all";
	tonality: Tonality;
};

/** A bit of audio: a single note or a voiced chord (concert pitch). */
export type EarSound =
	| { kind: "note"; note: string }
	| { kind: "chord"; root: string; quality: QualityId };

/**
 * A normalized ear question. `context` (optional) is played first to set a
 * reference — the key's root note (function) or tonic chord (degree) — then
 * `prompt` is the thing to identify.
 */
export type EarItem = {
	mode: EarMode;
	labels: string[];
	correctIndex: number;
	/** Label of the correct answer — used as the per-item accuracy category. */
	categoryLabel: string;
	/** Pitch classes to light on the keyboard once revealed (the answer). */
	revealNotes: string[];
	context?: EarSound;
	prompt: EarSound;
};

export function makeEarItem(settings: EarSettingsInput): EarItem {
	if (settings.mode === "degree") {
		const q = makeDegreeQuestion(settings);
		const targetPc = q.scaleNotes[q.targetIndex];
		return {
			mode: "degree",
			labels: q.labels,
			correctIndex: q.correctIndex,
			categoryLabel: q.labels[q.correctIndex],
			revealNotes: [targetPc],
			// Play the tonic chord first, then the note to identify.
			context: { kind: "chord", root: q.tonic, quality: q.tonality === "major" ? "maj" : "min" },
			prompt: { kind: "note", note: q.targetNote },
		};
	}

	if (settings.mode === "quality") {
		const q = makeQualityQuestion(settings);
		return {
			mode: "quality",
			labels: q.labels,
			correctIndex: q.correctIndex,
			categoryLabel: q.labels[q.correctIndex],
			revealNotes: chordTones(q.root, q.target),
			prompt: { kind: "chord", root: q.root, quality: q.target },
		};
	}

	// Function: play the key's root note first, then the chord to identify.
	const q = makeQuestion(settings);
	const { concertRoot, quality } = q.target;
	const hasKey = settings.keyChoice !== "all";
	return {
		mode: "function",
		labels: q.labels,
		correctIndex: q.correctIndex,
		categoryLabel: q.labels[q.correctIndex],
		revealNotes: chordTones(concertRoot, quality),
		context: hasKey ? { kind: "note", note: `${settings.keyChoice}3` } : undefined,
		prompt: { kind: "chord", root: concertRoot, quality },
	};
}
