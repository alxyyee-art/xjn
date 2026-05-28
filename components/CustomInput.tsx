'use client';

interface CustomInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CustomInput({ value, onChange }: CustomInputProps) {
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="还有别的想法？写在这里…（比如：想吃开胃的、最近上火）"
        maxLength={100}
        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm
                   placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300
                   focus:border-amber-400 transition-shadow"
      />
    </div>
  );
}
