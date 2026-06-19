import * as Tone from "tone";

const RIDE_URL = "/samples/ride/ride.wav";

/**
 * Sampled ride cymbal. The cymbal is decoded once into a buffer; each hit spawns a
 * fresh fire-and-forget ToneBufferSource so hits ring into and over each other (real
 * cymbal wash) instead of choking one another the way a re-triggered Player would.
 * Plays at native pitch — no pitch-shifting, which is what kept the metallic texture.
 */
export class Ride {
	private buffer: Tone.ToneAudioBuffer;
	private gain: Tone.Gain;

	constructor(volume = 0.7, onReady?: () => void, onError?: () => void) {
		this.gain = new Tone.Gain(volume).toDestination();
		this.buffer = new Tone.ToneAudioBuffer(RIDE_URL, () => onReady?.(), () => onError?.());
	}

	get ready(): boolean {
		return this.buffer.loaded;
	}

	setVolume(volume: number): void {
		this.gain.gain.value = volume;
	}

	play(time: number, velocity = 0.7): void {
		if (!this.buffer.loaded) return;
		const now = Tone.getContext().currentTime;
		const at = time > now ? time : now + 0.005;
		const source = new Tone.ToneBufferSource(this.buffer).connect(this.gain);
		source.onended = () => source.dispose();
		source.start(at, 0, undefined, velocity); // 4th arg = per-hit gain
	}

	dispose(): void {
		this.buffer.dispose();
		this.gain.dispose();
	}
}
