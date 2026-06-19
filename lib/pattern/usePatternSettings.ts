"use client";

import { usePersistentState } from "@/lib/storage/usePersistentState";
import { PROGRESSIONS } from "@/lib/theory/progressions";
import type { Progression } from "@/lib/theory/progressionEngine";
import { KeyCycle } from "./usePattern";

export type PatternSettings = {
	progressionId: string;
	setProgressionId: (v: string) => void;
	patternKey: string;
	setPatternKey: (v: string) => void;
	keyCycle: KeyCycle;
	setKeyCycle: (v: KeyCycle) => void;
	progression: Progression;
};

export function usePatternSettings(): PatternSettings {
	const [progressionId, setProgressionId] = usePersistentState("progressionId", PROGRESSIONS[0].id);
	const [patternKey, setPatternKey] = usePersistentState("patternKey", "C");
	const [keyCycle, setKeyCycle] = usePersistentState<KeyCycle>("keyCycle", "lock");
	const progression = PROGRESSIONS.find((p) => p.id === progressionId) ?? PROGRESSIONS[0];
	return { progressionId, setProgressionId, patternKey, setPatternKey, keyCycle, setKeyCycle, progression };
}
