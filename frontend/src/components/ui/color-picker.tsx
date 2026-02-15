import { PROJECT_COLORS } from '../constants/color';

interface ColorPickerProps {
  selectedColor: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export function ColorPicker({
  selectedColor,
  onChange,
  disabled,
}: ColorPickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-3">Цвет проекта</label>
      <div className="flex flex-wrap gap-2">
        {PROJECT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            disabled={disabled}
            className={`w-8 h-8 rounded-full border-2 transition-colors ${
              selectedColor === color
                ? 'border-gray-900 scale-110'
                : 'border-transparent hover:scale-110'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ backgroundColor: color }}
            aria-label={`Выбрать цвет ${color}`}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-full"
          style={{ backgroundColor: selectedColor }}
        />
        <span className="text-sm text-gray-700">
          {selectedColor || PROJECT_COLORS[0]}
        </span>
      </div>
    </div>
  );
}
