"use client";

import { usePersistentState } from "@/lib/storage/usePersistentState";
import { Level } from "@/lib/theory/chordPool";
import { Tonality } from "@/lib/theory/keyHarmony";
import { NextPreview } from "@/components/DrillControls";

export type DrillSettings = {
	level: Level;
	setLevel: (v: Level) => void;
	keyChoice: string | "all";
	setKeyChoice: (v: string | "all") => void;
	tonality: Tonality;
	setTonality: (v: Tonality) => void;
	showRoman: boolean;
	setShowRoman: (v: boolean) => void;
	showKeyboard: boolean;
	setShowKeyboard: (v: boolean) => void;
	barsPerChord: number;
	setBarsPerChord: (v: number) => void;
	nextPreview: NextPreview;
	setNextPreview: (v: NextPreview) => void;
};

export function useDrillSettings(): DrillSettings {
	const [level, setLevel] = usePersistentState<Level>("level", 1);
	const [keyChoice, setKeyChoice] = usePersistentState<string | "all">("keyChoice", "all");
	const [tonality, setTonality] = usePersistentState<Tonality>("tonality", "major");
	const [showRoman, setShowRoman] = usePersistentState("showRoman", false);
	const [showKeyboard, setShowKeyboard] = usePersistentState("showKeyboard", false);
	const [barsPerChord, setBarsPerChord] = usePersistentState("barsPerChord", 2);
	const [nextPreview, setNextPreview] = usePersistentState<NextPreview>("nextPreview", "auto");
	return {
		level, setLevel,
		keyChoice, setKeyChoice,
		tonality, setTonality,
		showRoman, setShowRoman,
		showKeyboard, setShowKeyboard,
		barsPerChord, setBarsPerChord,
		nextPreview, setNextPreview,
	};
}
