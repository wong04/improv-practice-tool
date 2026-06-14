import * as Tone from "tone";

export type Tick = {
	/** Beat index within the current bar (0-based). */
	beat: number;
	/** Bar index since the music started (0-based; negative during count-in). */
	bar: number;
	/** True while the count-in is still running. */
	counting: boolean;
	/** Audio-clock time of this tick, for sample-accurate scheduling. */
	time: number;
};

const ACCENT_PITCH = "C6";
const BEAT_PITCH = "C5";
const COUNT_PITCH = "G5";

/**
 * Single source of musical time, built on Tone.Transport. Emits a tick on every
 * beat (sample-accurately scheduled) so the metronome click, the visual beat
 * indicator, and the chord schedulers all stay in lockstep.
 */
export class Metronome {
	private transport = Tone.getTransport();
	private synth: Tone.Synth | null = null;
	private repeatId: number | null = null;
	private tickIndex = 0;

	beatsPerBar = 4;
	countInBars = 0;
	muted = false;
	accent = true;
	onTick: ((tick: Tick) => void) | null = null;

	get bpm(): number {
		return this.transport.bpm.value;
	}
	set bpm(value: number) {
		this.transport.bpm.value = value;
	}

	get running(): boolean {
		return this.transport.state === "started";
	}

	private getSynth(): Tone.Synth {
		if (!this.synth) {
			this.synth = new Tone.Synth({
				oscillator: { type: "triangle" },
				envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.02 },
				volume: -6,
			}).toDestination();
		}
		return this.synth;
	}

	start(): void {
		this.tickIndex = 0;
		if (this.repeatId === null) {
			this.repeatId = this.transport.scheduleRepeat((time) => this.fire(time), "4n");
		}
		this.transport.start();
	}

	stop(): void {
		this.transport.stop();
		if (this.repeatId !== null) {
			this.transport.clear(this.repeatId);
			this.repeatId = null;
		}
		this.tickIndex = 0;
	}

	dispose(): void {
		this.stop();
		this.synth?.dispose();
		this.synth = null;
	}

	private fire(time: number): void {
		const countTicks = this.countInBars * this.beatsPerBar;
		const musicalTick = this.tickIndex - countTicks;
		const counting = musicalTick < 0;
		const beat = ((musicalTick % this.beatsPerBar) + this.beatsPerBar) % this.beatsPerBar;
		const bar = Math.floor(musicalTick / this.beatsPerBar);

		if (!this.muted) {
			const pitch = counting ? COUNT_PITCH : beat === 0 && this.accent ? ACCENT_PITCH : BEAT_PITCH;
			const velocity = beat === 0 && !counting && this.accent ? 1 : 0.7;
			this.getSynth().triggerAttackRelease(pitch, "32n", time, velocity);
		}

		// Dispatch synchronously at look-ahead so consumers can schedule audio at the
		// future `time`. Visual updates are deferred to Tone.Draw by the consumers.
		const tick: Tick = { beat, bar, counting, time };
		this.onTick?.(tick);
		this.tickIndex++;
	}
}
