import { Note } from "tonal";

export type QualityId =
	| "maj"
	| "min"
	| "dim"
	| "aug"
	| "maj7"
	| "m7"
	| "7"
	| "m7b5"
	| "dim7"
	| "6"
	| "m6"
	| "mMaj7"
	| "9"
	| "maj9"
	| "m9"
	| "11"
	| "13"
	| "69"
	| "sus4"
	| "7b9"
	| "7#9"
	| "7#11"
	| "7b13"
	| "7alt";

export type Quality = {
	id: QualityId;
	/** Suffix appended to the root for display, e.g. "maj7" -> "Cmaj7". */
	symbol: string;
	/** Readable quality name (no root), e.g. "Half-dim" — used for quality ear training. */
	name: string;
	/** Tonal chord type, used to resolve the chord's notes for audio playback. */
	chordType: string;
};

const b = "♭"; // ♭
const s = "♯"; // ♯

export const QUALITIES: Record<QualityId, Quality> = {
	maj: { id: "maj", symbol: "Maj", name: "Major", chordType: "major" },
	min: { id: "min", symbol: "m", name: "Minor", chordType: "minor" },
	dim: { id: "dim", symbol: "°", name: "Diminished", chordType: "diminished" },
	aug: { id: "aug", symbol: "+", name: "Augmented", chordType: "augmented" },
	maj7: { id: "maj7", symbol: "maj7", name: "Major 7", chordType: "maj7" },
	m7: { id: "m7", symbol: "m7", name: "Minor 7", chordType: "m7" },
	"7": { id: "7", symbol: "7", name: "Dominant 7", chordType: "7" },
	m7b5: { id: "m7b5", symbol: `m7${b}5`, name: "Half-dim", chordType: "m7b5" },
	dim7: { id: "dim7", symbol: "°7", name: "Diminished 7", chordType: "dim7" },
	"6": { id: "6", symbol: "6", name: "Major 6", chordType: "6" },
	m6: { id: "m6", symbol: "m6", name: "Minor 6", chordType: "m6" },
	mMaj7: { id: "mMaj7", symbol: "mMaj7", name: "Minor-Major 7", chordType: "mMaj7" },
	"9": { id: "9", symbol: "9", name: "Dominant 9", chordType: "9" },
	maj9: { id: "maj9", symbol: "maj9", name: "Major 9", chordType: "maj9" },
	m9: { id: "m9", symbol: "m9", name: "Minor 9", chordType: "m9" },
	"11": { id: "11", symbol: "11", name: "Dominant 11", chordType: "11" },
	"13": { id: "13", symbol: "13", name: "Dominant 13", chordType: "13" },
	"69": { id: "69", symbol: "6/9", name: "6/9", chordType: "69" },
	sus4: { id: "sus4", symbol: "sus4", name: "Sus4", chordType: "sus4" },
	"7b9": { id: "7b9", symbol: `7${b}9`, name: `Dom 7${b}9`, chordType: "7b9" },
	"7#9": { id: "7#9", symbol: `7${s}9`, name: `Dom 7${s}9`, chordType: "7#9" },
	"7#11": { id: "7#11", symbol: `7${s}11`, name: `Dom 7${s}11`, chordType: "7#11" },
	"7b13": { id: "7b13", symbol: `7${b}13`, name: `Dom 7${b}13`, chordType: "7b13" },
	"7alt": { id: "7alt", symbol: "7alt", name: "Altered", chordType: "7alt" },
};

/** Collapse double accidentals (E##, Cbb) to a readable enharmonic spelling. */
export function simplifyRoot(root: string): string {
	if (root.includes("##") || root.includes("bb")) {
		return Note.simplify(root);
	}
	return root;
}

/** Prettify ASCII accidentals (Bb, F#) into Unicode (B♭, F♯) for display. */
function prettyRoot(root: string): string {
	return root.replace(/#/g, s).replace(/b/g, b);
}

/** Render a chord symbol from a root note and quality, e.g. ("C","maj7") -> "Cmaj7". */
export function formatChord(root: string, quality: QualityId): string {
	return `${prettyRoot(simplifyRoot(root))}${QUALITIES[quality].symbol}`;
}
