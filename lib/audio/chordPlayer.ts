import * as Tone from "tone";
import { Chord, Note } from "tonal";
import { QUALITIES, QualityId } from "@/lib/theory/qualities";

/**
 * Voice a chord as ascending frequencies starting around octave 3. Tonal returns
 * bare pitch classes, so we stack octaves to keep the voicing rising, then convert
 * to Hz (sidestepping Tone's note parser for spellings like E♯ or B𝄫).
 */
function voicing(root: string, quality: QualityId, startOctave = 3): number[] {
	const pitchClasses = Chord.getChord(QUALITIES[quality].chordType, root).notes;
	const freqs: number[] = [];
	let octave = startOctave;
	let prevChroma = -1;
	for (const pc of pitchClasses) {
		const chroma = Note.chroma(pc);
		if (chroma <= prevChroma) octave += 1;
		prevChroma = chroma;
		const freq = Note.freq(`${pc}${octave}`);
		if (freq) freqs.push(freq);
	}
	return freqs;
}

/** Plays voiced chords on the shared transport timeline. Used only when enabled. */
export class ChordPlayer {
	private synth: Tone.PolySynth<Tone.Synth> | null = null;

	private getSynth(): Tone.PolySynth<Tone.Synth> {
		if (!this.synth) {
			this.synth = new Tone.PolySynth(Tone.Synth, {
				oscillator: { type: "triangle" },
				envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.4 },
				volume: -14,
			}).toDestination();
		}
		return this.synth;
	}

	play(root: string, quality: QualityId, time: number, durationSeconds: number): void {
		const freqs = voicing(root, quality);
		if (!freqs.length) return;
		// Never schedule in the past — that silently drops the chord.
		const at = Math.max(time, Tone.now() + 0.02);
		this.getSynth().triggerAttackRelease(freqs, Math.max(0.1, durationSeconds * 0.95), at, 0.5);
	}

	dispose(): void {
		this.synth?.dispose();
		this.synth = null;
	}
}
