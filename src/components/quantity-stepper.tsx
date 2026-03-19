interface QuantityStepperProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
}

export function QuantityStepper({ id, value, onChange }: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-stone-300 bg-white p-1 shadow-sm">
      <button
        type="button"
        className="h-9 w-9 rounded-full text-lg text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-300"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label={`Decrease quantity for ${id}`}
      >
        -
      </button>
      <span id={id} className="min-w-10 text-center text-sm font-semibold text-stone-900">
        {value}
      </span>
      <button
        type="button"
        className="h-9 w-9 rounded-full text-lg text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-300"
        onClick={() => onChange(Math.min(12, value + 1))}
        disabled={value >= 12}
        aria-label={`Increase quantity for ${id}`}
      >
        +
      </button>
    </div>
  );
}