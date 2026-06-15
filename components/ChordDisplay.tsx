"use client";

export function ChordDisplay({
	symbol,
	nextSymbol,
	showNext,
	countdown,
	focused = false,
	roman,
	showRoman = false,
}: {
	symbol: string | null;
	nextSymbol?: string | null;
	showNext: boolean;
	/** Count-in number to show instead of the chord, or null. */
	countdown?: number | null;
	focused?: boolean;
	/** Roman-numeral analysis of the current chord, relative to the key. */
	roman?: string | null;
	showRoman?: boolean;
}) {
	const chordSize = focused ? "clamp(4.5rem, 26vw, 18rem)" : "clamp(3rem, 15vw, 9rem)";
	// Push the coral glow a little harder in the focus/fullscreen view.
	const chordGlow = focused ? "0 0 60px rgba(229, 72, 77, 0.35)" : "0 0 48px rgba(229, 72, 77, 0.28)";

	return (
		<div className="flex min-h-44 flex-col items-center justify-center gap-4 px-2 text-center">
			<div className="h-6 font-mono text-lg tracking-wide text-accent">
				{countdown == null && showRoman && roman ? roman : null}
			</div>

			{countdown != null ? (
				<div
					className="font-mono font-medium leading-none text-accent tabular-nums"
					style={{ fontSize: focused ? "clamp(6rem, 30vw, 20rem)" : "clamp(4rem, 20vw, 11rem)" }}
				>
					{countdown}
				</div>
			) : (
				<div
					className="font-display font-medium leading-none tracking-tight break-words"
					style={{
						fontSize: chordSize,
						textShadow: chordGlow,
					}}
				>
					{symbol ?? "—"}
				</div>
			)}

			<div className="h-6 font-sans text-sm uppercase tracking-[0.2em] text-muted">
				{countdown == null && showNext && nextSymbol ? (
					<span>
						next <span className="ml-1 font-semibold text-foreground/80">{nextSymbol}</span>
					</span>
				) : null}
			</div>
		</div>
	);
}
