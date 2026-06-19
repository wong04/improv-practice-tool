"use client";

import React from "react";
import { Bar } from "@/lib/pattern/usePattern";

export function PatternChart({
	bars,
	activeIndex,
	sections,
}: {
	bars: Bar[];
	activeIndex: number;
	sections?: Array<{ bar: number; label: string }>;
}) {
	const sectionMap = new Map(sections?.map((s) => [s.bar, s.label]));

	return (
		<div className="grid w-full max-w-xl grid-cols-2 gap-2 sm:grid-cols-4">
			{bars.map((bar, barIdx) => {
				const sectionLabel = sectionMap.get(barIdx);
				return (
					<React.Fragment key={barIdx}>
						{sectionLabel && (
							<div className="col-span-2 sm:col-span-4 pt-1 pb-0.5 font-mono text-xs font-semibold uppercase tracking-widest text-accent/70">
								{sectionLabel}
							</div>
						)}
						<div className="flex min-h-16 items-stretch gap-1 rounded-xl border border-white/10 bg-surface/40 p-1">
							{bar.continuation ? (
								<div
									className={`flex flex-1 items-center justify-center rounded-lg font-mono text-lg transition-colors ${
										bar.startIndex === activeIndex ? "text-accent/50" : "text-foreground/20"
									}`}
								>
									—
								</div>
							) : (
								bar.chords.map((chord, i) => {
									const globalIndex = bar.startIndex + i;
									const active = globalIndex === activeIndex;
									return (
										<div
											key={i}
											className={`flex flex-1 items-center justify-center rounded-lg px-1 text-center font-mono text-sm font-medium transition-colors ${
												active ? "bg-accent text-black" : "text-foreground/75"
											}`}
										>
											{chord.symbol}
										</div>
									);
								})
							)}
						</div>
					</React.Fragment>
				);
			})}
		</div>
	);
}
