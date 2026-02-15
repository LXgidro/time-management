import { CheckIcon, XMarkIcon } from '../../icons/Icons';

interface ConfirmButtonsProps {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function ConfirmButtons({
  onConfirm,
  onCancel,
  isDeleting,
}: ConfirmButtonsProps) {
  return (
    <div className="flex gap-2 justify-start">
      <button
        onClick={onConfirm}
        disabled={isDeleting}
        className="p-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors"
        title="Подтвердить"
      >
        <CheckIcon className="w-4 h-4" />
      </button>
      <button
        onClick={onCancel}
        disabled={isDeleting}
        className="p-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
        title="Отмена"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
