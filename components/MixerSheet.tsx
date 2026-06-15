"use client";

import { useEffect } from "react";
import { Ensemble, EnsembleProps } from "./Ensemble";

/**
 * Bottom sheet that surfaces the Ensemble mixer over the focus view, so all four
 * voices stay reachable while playing. Closes on backdrop tap, Esc, or the X.
 */
export function MixerSheet({
	open,
	onClose,
	ensemble,
}: {
	open: boolean;
	onClose: () => void;
	ensemble: EnsembleProps;
}) {
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.stopPropagation();
				onClose();
			}
		};
		// Capture so this runs before the page-level Esc (which exits fullscreen).
		window.addEventListener("keydown", onKey, true);
		return () => window.removeEventListener("keydown", onKey, true);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-40 flex flex-col justify-end">
			<button
				type="button"
				aria-label="Close mixer"
				onClick={onClose}
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
			/>
			<div className="sheet-up relative mx-auto flex max-h-[85vh] w-full max-w-xl flex-col overflow-y-auto rounded-t-3xl border border-white/10 bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl">
				<button
					type="button"
					onClick={onClose}
					aria-label="Close mixer"
					className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/15 text-muted transition-colors hover:text-foreground"
				>
					✕
				</button>
				<Ensemble {...ensemble} />
			</div>
		</div>
	);
}
