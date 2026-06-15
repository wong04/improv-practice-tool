"use client";

import { Note } from "tonal";

const WHITE_PCS = [0, 2, 4, 5, 7, 9, 11];
const WHITES = [...WHITE_PCS, ...WHITE_PCS]; // two octaves
const WHITE_COUNT = WHITES.length;

type KeyClass = "none" | "scale" | "chord";

function classFor(pc: number, chord: Set<number>, scale: Set<number>): KeyClass {
	if (chord.has(pc)) return "chord";
	if (scale.has(pc)) return "scale";
	return "none";
}

/**
 * Two-octave piano that lights up the scale to improvise with (light) and the
 * chord tones / safe landing notes (accent). Notes are matched by pitch class.
 */
export function Keyboard({
	chordTones,
	scaleNotes,
}: {
	chordTones: string[];
	scaleNotes: string[];
}) {
	const chord = new Set(chordTones.map((n) => Note.chroma(n)).filter((c): c is number => c != null));
	const scale = new Set(scaleNotes.map((n) => Note.chroma(n)).filter((c): c is number => c != null));

	// Anything in the scale (chord tones included) lights up coral; every other
	// key keeps its normal piano colour. Solid only — no alpha stacking.
	const keyBg = (k: KeyClass, black: boolean) => {
		if (k !== "none") return "bg-accent";
		return black ? "bg-neutral-900" : "bg-neutral-200";
	};
	const whiteBg = (k: KeyClass) => keyBg(k, false);
	const blackBg = (k: KeyClass) => keyBg(k, true);

	return (
		<div className="relative h-24 w-full max-w-xl select-none" aria-hidden>
			{/* white keys */}
			<div className="flex h-full w-full gap-px">
				{WHITES.map((pc, i) => (
					<div
						key={i}
						className={`flex-1 rounded-b-md border border-black/30 ${whiteBg(
							classFor(pc, chord, scale),
						)}`}
					/>
				))}
			</div>
			{/* black keys, positioned over white-key boundaries */}
			{WHITES.map((pc, i) => {
				if (i === WHITE_COUNT - 1) return null;
				const nextPc = WHITES[i + 1];
				const gap = (nextPc - pc + 12) % 12;
				if (gap !== 2) return null; // no black key between E–F and B–C
				const blackPc = (pc + 1) % 12;
				const left = ((i + 1) / WHITE_COUNT) * 100;
				return (
					<div
						key={`b${i}`}
						className={`absolute top-0 h-3/5 w-[5%] -translate-x-1/2 rounded-b-md border border-black/50 ${blackBg(
							classFor(blackPc, chord, scale),
						)}`}
						style={{ left: `${left}%` }}
					/>
				);
			})}
		</div>
	);
}
