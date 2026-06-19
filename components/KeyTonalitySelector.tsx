"use client";

import { Tonality } from "@/lib/theory/keyHarmony";
import { KEYS } from "@/lib/theory/transpose";

export function KeyTonalitySelector({
	keyChoice,
	onKeyChange,
	tonality,
	onTonalityChange,
	allKeysLabel = "All keys (chromatic)",
}: {
	keyChoice: string | "all";
	onKeyChange: (v: string | "all") => void;
	tonality: Tonality;
	onTonalityChange: (v: Tonality) => void;
	allKeysLabel?: string;
}) {
	const keyMode = keyChoice !== "all";
	return (
		<>
			<select
				value={keyChoice}
				onChange={(e) => onKeyChange(e.target.value as string | "all")}
				className="w-full rounded-lg border border-white/15 bg-background px-2 py-1.5 text-sm"
			>
				<option value="all">{allKeysLabel}</option>
				{KEYS.map((k) => (
					<option key={k} value={k}>
						{k}
					</option>
				))}
			</select>
			{keyMode && (
				<div className="inline-flex rounded-full border border-white/15 p-0.5">
					{(["major", "minor"] as Tonality[]).map((t) => (
						<button
							key={t}
							type="button"
							onClick={() => onTonalityChange(t)}
							className={`flex-1 rounded-full px-3 py-1 text-xs capitalize transition-colors ${
								tonality === t ? "bg-accent text-black" : "text-muted hover:text-foreground"
							}`}
						>
							{t}
						</button>
					))}
				</div>
			)}
		</>
	);
}
