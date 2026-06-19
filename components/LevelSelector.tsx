"use client";

import { Level, TIERS } from "@/lib/theory/chordPool";

export function LevelSelector({
	value,
	onChange,
	getTitle,
}: {
	value: Level;
	onChange: (l: Level) => void;
	getTitle?: (l: Level) => string;
}) {
	return (
		<div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
			{([1, 2, 3, 4] as Level[]).map((l) => (
				<button
					key={l}
					type="button"
					onClick={() => onChange(l)}
					title={getTitle?.(l)}
					className={`rounded-lg px-2 py-2 text-center text-xs font-medium transition-colors ${
						value === l ? "bg-accent text-black" : "bg-white/5 text-muted hover:bg-white/10"
					}`}
				>
					{TIERS[l].name}
				</button>
			))}
		</div>
	);
}
