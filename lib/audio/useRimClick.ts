"use client";

import { useCallback, useEffect, useRef } from "react";
import { RimClick } from "./rimClick";

export type PlayRimClick = (time: number, velocity?: number) => void;

/**
 * Owns a RimClick voice; `play` no-ops when `enabled` is false.
 * Created eagerly so the synth graph is ready before playback starts.
 */
export function useRimClick(enabled: boolean, volume: number): { play: PlayRimClick } {
	const ref = useRef<RimClick | null>(null);
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
			ref.current = new RimClick(volumeRef.current);
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

	const play = useCallback<PlayRimClick>((time, velocity) => {
		if (!enabledRef.current) return;
		if (!ref.current) ref.current = new RimClick(volumeRef.current);
		ref.current.play(time, velocity);
	}, []);

	return { play };
}
