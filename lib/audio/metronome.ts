import * as Tone from "tone";
import { rideSkipBeats } from "./ridePattern";

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

/** Off-beat feel: no offbeats / straight 8ths / swung 8ths / bossa nova. */
export type Subdivision = "none" | "straight" | "swing" | "bossanova";

/**
 * Single source of musical time, built on Tone.Transport. Emits a tick on every
 * beat (sample-accurately scheduled) so the metronome click, the visual beat
 * indicator, and the chord schedulers all stay in lockstep.
 */
export class Metronome {
	private transport = Tone.getTransport();
	private synth: Tone.Synth | null = null;
	private repeatId: number | null = null;
	private subRepeatId: number | null = null;
	private tickIndex = 0;
	private subTick = 0;
	private inCountIn = false;
	private currentBeat = 0;

	beatsPerBar = 4;
	countInBars = 0;
	muted = false;
	accent = true;
	/** Click only on beats 2 & 4 (jazz backbeat) instead of accenting beat 1. */
	backbeat = false;
	onTick: ((tick: Tick) => void) | null = null;
	/** Sampled ride cymbal; fired on the beat and the swung offbeat. Independent of the click. */
	onRide: ((time: number, velocity: number) => void) | null = null;
	/** Synthesized rim click; fired on beats 2 & 4 in bossa nova feel. */
	onRimClick: ((time: number, velocity: number) => void) | null = null;

	private _subdivision: Subdivision = "none";
	get subdivision(): Subdivision {
		return this._subdivision;
	}
	set subdivision(value: Subdivision) {
		this._subdivision = value;
		this.transport.swingSubdivision = "8n";
		this.transport.swing = value === "swing" ? 0.6 : 0;
	}

	private _clickVolume = 0.8;
	/** Click level as linear gain (0–1). */
	get clickVolume(): number {
		return this._clickVolume;
	}
	set clickVolume(value: number) {
		this._clickVolume = value;
		if (this.synth) this.synth.volume.value = Tone.gainToDb(value);
	}

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
			}).toDestination();
			this.synth.volume.value = Tone.gainToDb(this._clickVolume);
		}
		return this.synth;
	}

	start(): void {
		this.tickIndex = 0;
		this.subTick = 0;
		if (this.repeatId === null) {
			this.repeatId = this.transport.scheduleRepeat((time) => this.fire(time), "4n");
		}
		if (this.subRepeatId === null) {
			this.subRepeatId = this.transport.scheduleRepeat((time) => this.fireSub(time), "8n");
		}
		this.transport.start();
	}

	stop(): void {
		this.transport.stop();
		for (const id of [this.repeatId, this.subRepeatId]) {
			if (id !== null) this.transport.clear(id);
		}
		this.repeatId = null;
		this.subRepeatId = null;
		this.tickIndex = 0;
		this.subTick = 0;
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

		this.inCountIn = counting;

		// Backbeat: click only on beats 2 & 4 (skip during count-in).
		const backbeatBeat = beat === 1 || beat === 3;
		const shouldClick =
			!this.muted && (counting || !this.backbeat || (this.beatsPerBar === 4 && backbeatBeat));

		if (shouldClick) {
			const accented = beat === 0 && !counting && this.accent && !this.backbeat;
			const pitch = counting ? COUNT_PITCH : accented ? ACCENT_PITCH : BEAT_PITCH;
			const velocity = accented ? 1 : 0.7;
			this.getSynth().triggerAttackRelease(pitch, "32n", time, velocity);
		}

		if (this._subdivision !== "none" && !counting) {
			// Spang-a-lang / straight: ding on every beat.
			this.onRide?.(time, beat === 0 ? 1 : 0.8);

			// Bossa nova: rim click on beats 2 & 4 (indices 1 & 3).
			if (this._subdivision === "bossanova" && (beat === 1 || beat === 3)) {
				this.onRimClick?.(time, 0.7);
			}
		}

		this.currentBeat = beat;

		const tick: Tick = { beat, bar, counting, time };
		this.onTick?.(tick);
		this.tickIndex++;
	}

	// Off-beat ride "skip note" (the "da"). The 8n repeat fires on both on- and
	// off-beats; on-beats are handled by fire(), so only the odd (off-beat) ticks
	// sound here. Transport swing shifts these later when subdivision === "swing".
	// Which off-beats sound depends on the meter (see rideSkipBeats).
	private fireSub(time: number): void {
		const isOffbeat = this.subTick++ % 2 === 1;
		if (!isOffbeat || this._subdivision === "none" || this.inCountIn) return;
		if (rideSkipBeats(this.beatsPerBar, this._subdivision).includes(this.currentBeat)) {
			this.onRide?.(time, 0.6);
		}
	}
}
