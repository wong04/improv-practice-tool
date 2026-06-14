"use client";

export function ChordDisplay({
	symbol,
	nextSymbol,
	showNext,
}: {
	symbol: string | null;
	nextSymbol?: string | null;
	showNext: boolean;
}) {
	return (
		<div className="flex min-h-44 flex-col items-center justify-center gap-3 px-2 text-center">
			<div className="text-6xl font-bold leading-none tracking-tight break-words sm:text-8xl">
				{symbol ?? "—"}
			</div>
			<div className="h-6 text-base text-foreground/45">
				{showNext && nextSymbol ? (
					<span>
						next: <span className="font-medium text-foreground/70">{nextSymbol}</span>
					</span>
				) : null}
			</div>
		</div>
	);
}
