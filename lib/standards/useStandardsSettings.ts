"use client";

import { useMemo } from "react";
import { usePersistentState } from "@/lib/storage/usePersistentState";
import { STANDARDS, Standard, standardById } from "./standards";
import { standardToProgression } from "./standardProgression";
import type { Progression } from "@/lib/theory/progressionEngine";

export type StandardsSettings = {
	standardId: string;
	standardKey: string;
	setStandardKey: (v: string) => void;
	standard: Standard;
	standardProg: Progression;
	selectStandard: (std: Standard) => void;
};

export function useStandardsSettings(): StandardsSettings {
	const [standardId, setStandardId] = usePersistentState("standardId", STANDARDS[0].id);
	const [standardKey, setStandardKey] = usePersistentState("standardKey", STANDARDS[0].homeKey);
	const standard = standardById(standardId) ?? STANDARDS[0];
	const standardProg = useMemo(() => standardToProgression(standard), [standard]);
	const selectStandard = (std: Standard) => {
		setStandardId(std.id);
		setStandardKey(std.homeKey);
	};
	return { standardId, standardKey, setStandardKey, standard, standardProg, selectStandard };
}
