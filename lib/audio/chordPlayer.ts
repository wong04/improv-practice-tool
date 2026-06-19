import * as Tone from "tone";
import { Chord, Note } from "tonal";
import { QUALITIES, QualityId } from "@/lib/theory/qualities";

export type Voicing = "block" | "shell" | "rootless";

/** Pick which chord tones to sound for a voicing style. */
function voiceTones(pitchClasses: string[], voicing: Voicing): string[] {
	if (voicing === "shell" && pitchClasses.length >= 4) {
		return [pitchClasses[0], pitchClasses[1], pitchClasses[3]]; // root, 3rd, 7th
	}
	if (voicing === "rootless" && pitchClasses.length >= 3) {
		return pitchClasses.slice(1); // drop the root: 3-5-7-(9…)
	}
	return pitchClasses;
}

/**
 * Voice a chord as ascending frequencies starting around octave 3. Tonal returns
 * bare pitch classes, so we stack octaves to keep the voicing rising, then convert
 * to Hz (sidestepping Tone's note parser for spellings like E♯ or B𝄫).
 */
function voicing(
	root: string,
	quality: QualityId,
	style: Voicing = "block",
	startOctave = 3,
): number[] {
	const pitchClasses = voiceTones(Chord.getChord(QUALITIES[quality].chordType, root).notes, style);
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

// Salamander Grand Piano, sampled every minor third; Tone pitch-shifts between them.
const SALAMANDER_BASE_URL = "https://tonejs.github.io/audio/salamander/";
const SALAMANDER_URLS: Record<string, string> = {
	A0: "A0.mp3", C1: "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
	A1: "A1.mp3", C2: "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
	A2: "A2.mp3", C3: "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
	A3: "A3.mp3", C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
	A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
	A5: "A5.mp3", C6: "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
	A6: "A6.mp3", C7: "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
	A7: "A7.mp3", C8: "C8.mp3",
};

/** Plays voiced chords on a sampled grand piano. Used only when enabled. */
export class ChordPlayer {
	private sampler: Tone.Sampler;
	voicing: Voicing = "block";

	constructor(volume = 0.8, onReady?: () => void, onError?: () => void) {
		// Construct eagerly so the samples start downloading right away (preload).
		this.sampler = new Tone.Sampler({
			urls: SALAMANDER_URLS,
			baseUrl: SALAMANDER_BASE_URL,
			release: 1,
			volume: Tone.gainToDb(volume),
			onload: onReady,
			onerror: onError,
		}).toDestination();
	}

	get ready(): boolean {
		return this.sampler.loaded;
	}

	/** Set the chord level as linear gain (0–1). */
	setVolume(volume: number): void {
		this.sampler.volume.value = Tone.gainToDb(volume);
	}

	play(root: string, quality: QualityId, time: number, durationSeconds: number): void {
		if (!this.sampler.loaded) return; // samples not ready yet — skip silently
		const freqs = voicing(root, quality, this.voicing);
		if (!freqs.length) return;
		// Schedule exactly on the beat `time` (the click uses the same value). Only nudge
		// forward if `time` is already in the past — compare against the raw audio clock,
		// not Tone.now() (which adds the look-ahead and would push every chord late).
		const at = this.at(time);
		this.sampler.triggerAttackRelease(freqs, Math.max(0.1, durationSeconds * 0.95), at, 0.5);
	}

	/** Play a single pitch (e.g. "E4") — used for scale-degree ear training. */
	playPitch(note: string, time: number, durationSeconds: number): void {
		if (!this.sampler.loaded) return;
		const freq = Note.freq(note);
		if (!freq) return;
		this.sampler.triggerAttackRelease(freq, Math.max(0.1, durationSeconds * 0.95), this.at(time), 0.6);
	}

	/** Roll the chord's tones one at a time, `stepSeconds` apart. */
	arpeggiate(root: string, quality: QualityId, time: number, stepSeconds = 0.22): void {
		if (!this.sampler.loaded) return;
		const freqs = voicing(root, quality, this.voicing);
		const start = this.at(time);
		freqs.forEach((freq, i) => {
			this.sampler.triggerAttackRelease(freq, Math.max(0.2, stepSeconds * 1.4), start + i * stepSeconds, 0.5);
		});
	}

	/** Play a sequence of chords back-to-back — used to establish a key (cadence). */
	playSequence(
		chords: { root: string; quality: QualityId }[],
		startTime: number,
		perChordSeconds: number,
	): void {
		chords.forEach((chord, i) => {
			this.play(chord.root, chord.quality, startTime + i * perChordSeconds, perChordSeconds);
		});
	}

	/** Resolve a scheduling time against the raw audio clock (nudge past times forward). */
	private at(time: number): number {
		const now = Tone.getContext().currentTime;
		return time > now ? time : now + 0.005;
	}

	dispose(): void {
		this.sampler.dispose();
	}
}
