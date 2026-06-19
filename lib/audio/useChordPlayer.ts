"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QualityId } from "@/lib/theory/qualities";
import { ChordPlayer, Voicing } from "./chordPlayer";

export type PlayChord = (
	root: string,
	quality: QualityId,
	time: number,
	durationSeconds: number,
) => void;

export type PlayPitch = (note: string, time: number, durationSeconds: number) => void;
export type Arpeggiate = (root: string, quality: QualityId, time: number, stepSeconds?: number) => void;
export type PlaySequence = (
	chords: { root: string; quality: QualityId }[],
	startTime: number,
	perChordSeconds: number,
) => void;

/**
 * Owns a ChordPlayer and returns a `play` that no-ops while `enabled` is false,
 * plus a `ready` flag that is false while the piano samples are still loading.
 * @param volume chord level as linear gain (0–1).
 */
export function useChordPlayer(
	enabled: boolean,
	volume: number,
	voicing: Voicing = "block",
): {
	play: PlayChord;
	playPitch: PlayPitch;
	arpeggiate: Arpeggiate;
	playSequence: PlaySequence;
	ready: boolean;
	loadError: boolean;
} {
	const playerRef = useRef<ChordPlayer | null>(null);
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
	const voicingRef = useRef(voicing);
	useEffect(() => {
		voicingRef.current = voicing;
	});

	// Create the player as soon as audio is enabled so the piano samples preload
	// before the user presses Start.
	useEffect(() => {
		if (enabled && !playerRef.current) {
			const player = new ChordPlayer(volumeRef.current, () => setReady(true), () => setLoadError(true));
			player.voicing = voicingRef.current;
			playerRef.current = player;
			if (player.ready) setReady(true);
		}
	}, [enabled]);

	// Keep the live player's level + voicing in sync.
	useEffect(() => {
		playerRef.current?.setVolume(volume);
	}, [volume]);
	useEffect(() => {
		if (playerRef.current) playerRef.current.voicing = voicing;
	}, [voicing]);

	useEffect(() => {
		return () => {
			playerRef.current?.dispose();
			playerRef.current = null;
		};
	}, []);

	// Lazily ensure a player exists (audio may have been enabled just now).
	const ensurePlayer = useCallback((): ChordPlayer | null => {
		if (!enabledRef.current) return null;
		if (!playerRef.current) {
			const player = new ChordPlayer(volumeRef.current, () => setReady(true), () => setLoadError(true));
			player.voicing = voicingRef.current;
			playerRef.current = player;
		}
		return playerRef.current;
	}, []);

	const play = useCallback<PlayChord>(
		(root, quality, time, durationSeconds) => {
			ensurePlayer()?.play(root, quality, time, durationSeconds);
		},
		[ensurePlayer],
	);

	const playPitch = useCallback<PlayPitch>(
		(note, time, durationSeconds) => {
			ensurePlayer()?.playPitch(note, time, durationSeconds);
		},
		[ensurePlayer],
	);

	const arpeggiate = useCallback<Arpeggiate>(
		(root, quality, time, stepSeconds) => {
			ensurePlayer()?.arpeggiate(root, quality, time, stepSeconds);
		},
		[ensurePlayer],
	);

	const playSequence = useCallback<PlaySequence>(
		(chords, startTime, perChordSeconds) => {
			ensurePlayer()?.playSequence(chords, startTime, perChordSeconds);
		},
		[ensurePlayer],
	);

	return { play, playPitch, arpeggiate, playSequence, ready, loadError };
}
