"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bass } from "./bass";

export type PlayBass = (note: string, time: number, durationSeconds: number) => void;

/**
 * Owns a Bass voice; `play` no-ops while `enabled` is false. `ready` is false while
 * the bass samples are still loading. The voice is created as soon as it's enabled so
 * the samples preload before the user presses Start.
 */
export function useBass(enabled: boolean, volume: number): { play: PlayBass; ready: boolean; loadError: boolean } {
	const ref = useRef<Bass | null>(null);
	const [ready, setReady] = useState(false);
	const [loadError, setLoadError] = useState(false);
	const enabledRef = useRef(enabled);
	useEffect(() => {
		enabledRef.current = enabled;
	});
	const volumeRef = useRef(volume);
	useEffect(() => {
		volumeRef.current = volume;
	});

	useEffect(() => {
		if (enabled && !ref.current) {
			ref.current = new Bass(volumeRef.current, () => setReady(true), () => setLoadError(true));
			if (ref.current.ready) setReady(true);
		}
	}, [enabled]);

	useEffect(() => {
		ref.current?.setVolume(volume);
	}, [volume]);

	useEffect(() => {
		return () => {
			ref.current?.dispose();
			ref.current = null;
		};
	}, []);

	const play = useCallback<PlayBass>((note, time, durationSeconds) => {
		if (!enabledRef.current) return;
		if (!ref.current) ref.current = new Bass(volumeRef.current, () => setReady(true), () => setLoadError(true));
		ref.current.play(note, time, durationSeconds);
	}, []);

	return { play, ready, loadError };
}
