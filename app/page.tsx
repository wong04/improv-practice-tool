"use client";

import { useState } from "react";

type Mode = "drill" | "patterns";

export default function Home() {
	const [mode, setMode] = useState<Mode>("drill");

	return (
		<main className="flex flex-1 flex-col items-center px-4 py-8">
			<header className="mb-8 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">Improv Practice Tool</h1>
				<p className="mt-1 text-sm text-foreground/60">
					Drill chords and jazz patterns in time.
				</p>
			</header>

			<nav className="mb-10 inline-flex rounded-full border border-foreground/15 p-1">
				<TabButton active={mode === "drill"} onClick={() => setMode("drill")}>
					Drill
				</TabButton>
				<TabButton active={mode === "patterns"} onClick={() => setMode("patterns")}>
					Patterns
				</TabButton>
			</nav>

			<section className="flex w-full max-w-xl flex-1 flex-col items-center justify-center">
				<div className="text-7xl font-bold tracking-tight tabular-nums">
					{mode === "drill" ? "Cmaj7" : "ii–V–I"}
				</div>
				<p className="mt-4 text-sm text-foreground/50">
					{mode === "drill" ? "Random chord drill" : "Jazz pattern practice"} — coming together.
				</p>
			</section>
		</main>
	);
}

function TabButton({
	active,
	onClick,
	children,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
				active ? "bg-foreground text-background" : "text-foreground/60 hover:text-foreground"
			}`}
		>
			{children}
		</button>
	);
}
