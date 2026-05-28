'use client';

interface ChipOption<T extends string = string> {
  value: T;
  label: string;
  emoji: string;
}

interface ChipGroupProps<T extends string = string> {
  options: ChipOption<T>[];
  value: T[];
  onChange: (selected: T[]) => void;
}

export default function ChipGroup<T extends string = string>({ options, value, onChange }: ChipGroupProps<T>) {
  function toggle(val: T) {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={`chip ${selected ? 'chip--selected' : ''}`}
          >
            <span>{opt.emoji}</span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
