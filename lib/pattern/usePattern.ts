"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";
import { Note } from "tonal";
import { Tick } from "@/lib/audio/metronome";
import { Instrument, KEYS } from "@/lib/theory/transpose";
import { expandProgression, Progression, ResolvedChord } from "@/lib/theory/progressionEngine";

export type KeyCycle = "lock" | "cycle4" | "random";

export type PatternSettings = {
	progression: Progression;
	instrument: Instrument;
	keyCycle: KeyCycle;
	/** Fired when a full repetition of the progression completes. */
	onRep?: () => void;
	/** Called when a new chord starts sounding, with its audio-clock time. */
	onChordChange?: (chord: ResolvedChord, time: number) => void;
};

export type Bar = { chords: ResolvedChord[]; startIndex: number };

export type PatternState = {
	/** Concert key the pattern is currently sounding in. */
	tonic: string;
	chords: ResolvedChord[];
	bars: Bar[];
	activeIndex: number;
	onTick: (tick: Tick) => void;
	reset: () => void;
};

/** Snap a transposed note to the readable spelling used in KEYS (e.g. Cb -> B). */
function normalizeKey(note: string): string {
	const chroma = Note.chroma(note);
	return KEYS.find((k) => Note.chroma(k) === chroma) ?? note;
}

function nextTonic(current: string, cycle: KeyCycle): string {
	if (cycle === "lock") return current;
	if (cycle === "cycle4") return normalizeKey(Note.transpose(current, "4P"));
	let pick = current;
	while (pick === current) pick = KEYS[Math.floor(Math.random() * KEYS.length)];
	return pick;
}

/** Group a flat chord list into 4-beat bars for the chart display. */
function groupIntoBars(chords: ResolvedChord[]): Bar[] {
	const bars: Bar[] = [];
	let bar: ResolvedChord[] = [];
	let beats = 0;
	let startIndex = 0;
	chords.forEach((chord, i) => {
		if (bar.length === 0) startIndex = i;
		bar.push(chord);
		beats += chord.beats;
		if (beats >= 4) {
			bars.push({ chords: bar, startIndex });
			bar = [];
			beats = 0;
		}
	});
	if (bar.length) bars.push({ chords: bar, startIndex });
	return bars;
}

/** Drives pattern practice: walks a progression in time, cycling keys per rep. */
export function usePattern(settings: PatternSettings): PatternState {
	const { progression, instrument, keyCycle } = settings;

	const onRepRef = useRef(settings.onRep);
	useEffect(() => {
		onRepRef.current = settings.onRep;
	});
	const cycleRef = useRef(keyCycle);
	useEffect(() => {
		cycleRef.current = keyCycle;
	});
	const onChordChangeRef = useRef(settings.onChordChange);
	useEffect(() => {
		onChordChangeRef.current = settings.onChordChange;
	});

	const [tonic, setTonic] = useState(progression.defaultTonic);
	const [activeIndex, setActiveIndex] = useState(0);
	const beatRef = useRef(0);

	// Reset to the progression's home key whenever the chosen pattern changes
	// (render-phase reset on prop change; the beat counter resets on Start).
	const [prevProgId, setPrevProgId] = useState(progression.id);
	if (progression.id !== prevProgId) {
		setPrevProgId(progression.id);
		setTonic(progression.defaultTonic);
		setActiveIndex(0);
	}

	const chords = useMemo(
		() => expandProgression(progression, tonic, instrument),
		[progression, tonic, instrument],
	);
	const bars = useMemo(() => groupIntoBars(chords), [chords]);

	// Beat offset at which each chord begins, plus the total length of the loop.
	const { starts, total } = useMemo(() => {
		const s: number[] = [];
		let acc = 0;
		for (const chord of chords) {
			s.push(acc);
			acc += chord.beats;
		}
		return { starts: s, total: acc };
	}, [chords]);

	const startsRef = useRef(starts);
	const totalRef = useRef(total);
	const chordsRef = useRef(chords);
	useEffect(() => {
		startsRef.current = starts;
		totalRef.current = total;
		chordsRef.current = chords;
	});

	const lastIdxRef = useRef(-1);
	const reset = useCallback(() => {
		beatRef.current = 0;
		lastIdxRef.current = -1;
		setActiveIndex(0);
	}, []);

	const onTick = useCallback((tick: Tick) => {
		if (tick.counting) return;
		const pos = beatRef.current % totalRef.current;

		let idx = 0;
		const s = startsRef.current;
		for (let i = 0; i < s.length; i++) {
			if (pos >= s[i]) idx = i;
			else break;
		}
		if (idx !== lastIdxRef.current) {
			lastIdxRef.current = idx;
			const chord = chordsRef.current[idx];
			if (chord) onChordChangeRef.current?.(chord, tick.time);
		}
		// Defer the highlight move to land on the beat, not at look-ahead.
		Tone.getDraw().schedule(() => setActiveIndex(idx), tick.time);

		beatRef.current += 1;
		if (beatRef.current >= totalRef.current) {
			beatRef.current = 0;
			Tone.getDraw().schedule(() => setTonic((t) => nextTonic(t, cycleRef.current)), tick.time);
			onRepRef.current?.();
		}
	}, []);

	return { tonic, chords, bars, activeIndex, onTick, reset };
}
