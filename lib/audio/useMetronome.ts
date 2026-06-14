"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { ensureAudioReady } from "./audioContext";
import { Metronome, Tick } from "./metronome";

export type MetronomeConfig = {
	bpm: number;
	beatsPerBar: number;
	countInBars: number;
	muted: boolean;
	/** Engine hook called on every tick (sample-accurately, via Tone.Draw). */
	onTick?: (tick: Tick) => void;
};

export type MetronomeControls = {
	running: boolean;
	/** Current beat within the bar (0-based), or -1 when stopped. */
	beat: number;
	counting: boolean;
	start: () => Promise<void>;
	stop: () => void;
	toggle: () => Promise<void>;
};

/**
 * Owns a single Metronome instance and keeps it in sync with `config`.
 * Returns transport controls plus the live beat for the visual indicator.
 */
export function useMetronome(config: MetronomeConfig): MetronomeControls {
	const metronomeRef = useRef<Metronome | null>(null);
	const onTickRef = useRef(config.onTick);
	useEffect(() => {
		onTickRef.current = config.onTick;
	});

	const [running, setRunning] = useState(false);
	const [beat, setBeat] = useState(-1);
	const [counting, setCounting] = useState(false);

	// Lazily create the metronome on the client only (avoids touching audio on SSR).
	const getMetronome = useCallback((): Metronome => {
		if (!metronomeRef.current) {
			const m = new Metronome();
			m.onTick = (tick) => {
				// Engines run at audio-rate (they schedule sound at tick.time); the beat
				// indicator is deferred to Tone.Draw so it stays visually in sync.
				onTickRef.current?.(tick);
				Tone.getDraw().schedule(() => {
					setBeat(tick.beat);
					setCounting(tick.counting);
				}, tick.time);
			};
			metronomeRef.current = m;
		}
		return metronomeRef.current;
	}, []);

	// Push config changes into the live metronome.
	useEffect(() => {
		const m = getMetronome();
		m.bpm = config.bpm;
		m.beatsPerBar = config.beatsPerBar;
		m.countInBars = config.countInBars;
		m.muted = config.muted;
	}, [config.bpm, config.beatsPerBar, config.countInBars, config.muted, getMetronome]);

	useEffect(() => {
		return () => {
			metronomeRef.current?.dispose();
			metronomeRef.current = null;
		};
	}, []);

	const start = useCallback(async () => {
		await ensureAudioReady();
		getMetronome().start();
		setRunning(true);
	}, [getMetronome]);

	const stop = useCallback(() => {
		metronomeRef.current?.stop();
		setRunning(false);
		setBeat(-1);
		setCounting(false);
	}, []);

	const toggle = useCallback(async () => {
		if (metronomeRef.current?.running) {
			stop();
		} else {
			await start();
		}
	}, [start, stop]);

	return { running, beat, counting, start, stop, toggle };
}
