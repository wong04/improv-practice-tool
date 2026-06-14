"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

const PREFIX = "ipt.";

/**
 * useState that mirrors to localStorage. Starts from `initial` (so server and
 * client first render match), then hydrates from storage after mount and
 * persists every change.
 */
export function usePersistentState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
	const [value, setValue] = useState<T>(initial);
	const loaded = useRef(false);

	useEffect(() => {
		try {
			const raw = localStorage.getItem(PREFIX + key);
			// Hydrate from storage after mount (kept out of render to avoid SSR mismatch).
			// eslint-disable-next-line react-hooks/set-state-in-effect
			if (raw !== null) setValue(JSON.parse(raw) as T);
		} catch {
			// ignore unreadable/corrupt storage
		}
		loaded.current = true;
	}, [key]);

	useEffect(() => {
		if (!loaded.current) return;
		try {
			localStorage.setItem(PREFIX + key, JSON.stringify(value));
		} catch {
			// ignore quota/availability errors
		}
	}, [key, value]);

	return [value, setValue];
}
