'use client';

interface ChipOption {
  value: string;
  label: string;
  emoji: string;
}

interface ChipGroupProps {
  options: ChipOption[];
  value: string[];
  onChange: (selected: string[]) => void;
}

export default function ChipGroup({ options, value, onChange }: ChipGroupProps) {
  function toggle(val: string) {
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
