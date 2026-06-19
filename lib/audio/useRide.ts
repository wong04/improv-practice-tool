"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Ride } from "./ride";

export type PlayRide = (time: number, velocity?: number) => void;

/**
 * Owns a Ride voice; `play` no-ops while `enabled` is false. `ready` is false while the
 * cymbal sample is still loading. Created as soon as enabled so it preloads before Start.
 */
export function useRide(enabled: boolean, volume: number): { play: PlayRide; ready: boolean; loadError: boolean } {
	const ref = useRef<Ride | null>(null);
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
			ref.current = new Ride(volumeRef.current, () => setReady(true), () => setLoadError(true));
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

	const play = useCallback<PlayRide>((time, velocity) => {
		if (!enabledRef.current) return;
		if (!ref.current) ref.current = new Ride(volumeRef.current, () => setReady(true), () => setLoadError(true));
		ref.current.play(time, velocity);
	}, []);

	return { play, ready, loadError };
}
