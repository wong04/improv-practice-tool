"use client";

import { useEffect, useRef, useState } from "react";
import { Level, TIERS } from "@/lib/theory/chordPool";
import { KEY_LEVEL_BLURB } from "@/lib/theory/keyHarmony";

export function LevelInfoPopover({ keyMode }: { keyMode: boolean }) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const onDoc = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", onDoc);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onDoc);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	return (
		<div ref={ref} className="relative inline-block">
			<button
				type="button"
				aria-expanded={open}
				aria-label="What each difficulty level includes"
				onClick={() => setOpen((o) => !o)}
				className="grid h-4 w-4 place-items-center rounded-full border border-white/30 text-[10px] leading-none text-muted transition-colors hover:border-accent hover:text-foreground"
			>
				?
			</button>
			{open && (
				<div className="absolute left-0 top-6 z-20 w-64 rounded-xl border border-white/15 bg-surface p-3 text-xs shadow-xl">
					<p className="mb-2 font-medium text-foreground">
						{keyMode ? "Chords drawn from the selected key" : "Random chord qualities"}
					</p>
					<ul className="flex flex-col gap-1.5">
						{([1, 2, 3, 4] as Level[]).map((l) => (
							<li key={l} className="flex gap-2">
								<span className="font-mono text-accent">L{l}</span>
								<span className="text-muted">
									{keyMode ? KEY_LEVEL_BLURB[l] : `${TIERS[l].name} — ${TIERS[l].description}`}
								</span>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
