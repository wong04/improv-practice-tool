import * as Tone from "tone";

export type { BassMode } from "./bassNote";
export { bassNote } from "./bassNote";

// Pizzicato upright/acoustic bass (FluidR3 GM "acoustic bass"), bundled under /public.
// Sampled sparsely; Tone pitch-shifts to fill the gaps, like the piano.
const BASS_BASE_URL = "/samples/bass/";
const BASS_URLS: Record<string, string> = {
	E1: "E1.mp3",
	A1: "A1.mp3",
	C2: "C2.mp3",
	D2: "D2.mp3",
	G2: "G2.mp3",
	C3: "C3.mp3",
};
// The upright-bass samples are recorded ~18 dB quieter than the Salamander piano.
// Multiply user volume by this factor before converting to dB to compensate.
const BASS_BOOST = 8;

/** Sampled upright bass, played one note per beat on the shared transport. */
export class Bass {
	private sampler: Tone.Sampler;

	constructor(volume = 0.85, onReady?: () => void) {
		this.sampler = new Tone.Sampler({
			urls: BASS_URLS,
			baseUrl: BASS_BASE_URL,
			release: 0.4,
			volume: Tone.gainToDb(volume * BASS_BOOST),
			onload: onReady,
		}).toDestination();
	}

	get ready(): boolean {
		return this.sampler.loaded;
	}

	setVolume(volume: number): void {
		this.sampler.volume.value = Tone.gainToDb(volume * BASS_BOOST);
	}

	/** Play a pitch-class note in the bass register at the given time. */
	play(note: string, time: number, durationSeconds: number): void {
		if (!this.sampler.loaded) return;
		// Tone.Sampler needs a note name, not Hz. bassNote() only returns clean pitch
		// classes (no double accidentals), so appending the octave is safe.
		const noteName = `${note}2`;
		const now = Tone.getContext().currentTime;
		const at = time > now ? time : now + 0.005;
		this.sampler.triggerAttackRelease(noteName, Math.max(0.1, durationSeconds * 0.9), at, 0.9);
	}

	dispose(): void {
		this.sampler.dispose();
	}
}
