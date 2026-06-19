import * as Tone from "tone";

/**
 * Synthesized cross-stick / rim click for bossa nova feel.
 * Short triangle-wave burst at ~660 Hz — sits in the midrange, clearly audible
 * against the high-frequency ride cymbal sample.
 */
export class RimClick {
	private synth: Tone.Synth;
	private gain: Tone.Gain;

	constructor(volume = 0.5) {
		this.gain = new Tone.Gain(volume).toDestination();
		this.synth = new Tone.Synth({
			oscillator: { type: "triangle" },
			envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.02 },
		}).connect(this.gain);
	}

	setVolume(volume: number): void {
		this.gain.gain.value = volume;
	}

	play(time: number, velocity = 0.8): void {
		const now = Tone.getContext().currentTime;
		const at = time > now ? time : now + 0.005;
		this.synth.triggerAttackRelease("E5", "32n", at, velocity);
	}

	dispose(): void {
		this.synth.dispose();
		this.gain.dispose();
	}
}
