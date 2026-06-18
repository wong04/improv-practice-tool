import * as Tone from "tone";

/**
 * Synthesized rim click for bossa nova feel. A short burst of highpass-filtered white
 * noise; no sample needed. Sounds like a cross-stick or woodblock hit.
 */
export class RimClick {
	private synth: Tone.NoiseSynth;
	private filter: Tone.Filter;
	private gain: Tone.Gain;

	constructor(volume = 0.5) {
		this.gain = new Tone.Gain(volume).toDestination();
		this.filter = new Tone.Filter(3000, "highpass").connect(this.gain);
		this.synth = new Tone.NoiseSynth({
			noise: { type: "white" },
			envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.02 },
		}).connect(this.filter);
	}

	setVolume(volume: number): void {
		this.gain.gain.value = volume;
	}

	play(time: number, velocity = 0.6): void {
		const now = Tone.getContext().currentTime;
		const at = time > now ? time : now + 0.005;
		this.synth.triggerAttack(at, velocity);
	}

	dispose(): void {
		this.synth.dispose();
		this.filter.dispose();
		this.gain.dispose();
	}
}
