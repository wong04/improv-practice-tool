import * as Tone from "tone";
import { ensureAudioReady } from "@/lib/audio/audioContext";
import { Arpeggiate, PlayChord, PlayPitch, PlaySequence } from "@/lib/audio/useChordPlayer";
import { EarItem, EarSound } from "./earItem";

export type EarPlayer = {
	play: PlayChord;
	playPitch: PlayPitch;
	arpeggiate: Arpeggiate;
	playSequence: PlaySequence;
};

const CONTEXT_NOTE_SECONDS = 1.0;
const CONTEXT_CHORD_SECONDS = 1.4;
const GAP_SECONDS = 0.35;
const PROMPT_CHORD_SECONDS = 2;
const PROMPT_NOTE_SECONDS = 1.6;

function soundDuration(sound: EarSound): number {
	if (sound.kind === "note") return CONTEXT_NOTE_SECONDS;
	return CONTEXT_CHORD_SECONDS;
}

function playSound(player: EarPlayer, sound: EarSound, at: number, isPrompt: boolean): void {
	if (sound.kind === "note") {
		player.playPitch(sound.note, at, isPrompt ? PROMPT_NOTE_SECONDS : CONTEXT_NOTE_SECONDS);
		return;
	}
	player.play(sound.root, sound.quality, at, isPrompt ? PROMPT_CHORD_SECONDS : CONTEXT_CHORD_SECONDS);
}

/** Sound an ear question: optional context (root note / tonic chord), then the prompt. */
export function playEarItem(player: EarPlayer, item: EarItem): void {
	void ensureAudioReady().then(() => {
		let at = Tone.now() + 0.05;
		if (item.context) {
			playSound(player, item.context, at, false);
			at += soundDuration(item.context) + GAP_SECONDS;
		}
		playSound(player, item.prompt, at, true);
	});
}

/** Re-hear just the prompt spread out: arpeggiate a chord, or replay a single note. */
export function arpeggiateEarItem(player: EarPlayer, item: EarItem): void {
	void ensureAudioReady().then(() => {
		const start = Tone.now() + 0.05;
		if (item.prompt.kind === "note") {
			player.playPitch(item.prompt.note, start, PROMPT_NOTE_SECONDS);
			return;
		}
		player.arpeggiate(item.prompt.root, item.prompt.quality, start);
	});
}
