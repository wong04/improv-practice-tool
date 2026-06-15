"use client";

/** Shared form controls used across the transport bar and the ensemble mixer. */

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex items-center justify-between gap-3">
			<span className="text-sm text-muted">{label}</span>
			{children}
		</div>
	);
}

export function Segmented<T extends string>({
	value,
	onChange,
	options,
	ariaLabel,
}: {
	value: T;
	onChange: (value: T) => void;
	options: [T, string][];
	ariaLabel?: string;
}) {
	return (
		<div
			role="group"
			aria-label={ariaLabel}
			className="inline-flex rounded-full border border-white/15 p-0.5"
		>
			{options.map(([val, label]) => (
				<button
					key={val}
					type="button"
					onClick={() => onChange(val)}
					aria-pressed={value === val}
					className={`min-h-[36px] rounded-full px-3 py-1.5 text-sm transition-colors ${
						value === val ? "bg-accent text-black" : "text-muted hover:text-foreground"
					}`}
				>
					{label}
				</button>
			))}
		</div>
	);
}

export function IconToggle({
	on,
	onClick,
	label,
	title,
}: {
	on: boolean;
	onClick: () => void;
	label: string;
	title: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={on}
			title={title}
			className={`min-h-[44px] rounded-full border px-3 py-2 text-sm transition-colors ${
				on ? "border-accent/60 text-foreground" : "border-white/15 text-muted hover:text-foreground"
			}`}
		>
			{label}
		</button>
	);
}

export function VolumeSlider({
	label,
	value,
	onChange,
	disabled = false,
}: {
	label: string;
	value: number;
	onChange: (value: number) => void;
	disabled?: boolean;
}) {
	return (
		<div className={`flex items-center gap-2 ${disabled ? "opacity-40" : ""}`}>
			<span className="w-16 shrink-0 text-sm text-muted">{label}</span>
			<input
				type="range"
				min={0}
				max={1}
				step={0.01}
				value={value}
				disabled={disabled}
				onChange={(e) => onChange(Number(e.target.value))}
				aria-label={`${label} volume`}
				className="fader flex-1 accent-accent"
			/>
			<span className="w-9 text-right font-mono text-sm tabular-nums text-foreground/80">
				{Math.round(value * 100)}
			</span>
		</div>
	);
}

/** Small LED dot that glows coral when the channel is active. */
export function Led({ on }: { on: boolean }) {
	return (
		<span
			aria-hidden
			className={`h-2 w-2 shrink-0 rounded-full transition-all ${
				on ? "bg-accent shadow-[0_0_10px_var(--accent)]" : "bg-white/15"
			}`}
		/>
	);
}
