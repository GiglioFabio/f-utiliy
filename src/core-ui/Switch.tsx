interface SwitchProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function Switch({ id, checked, onCheckedChange }: SwitchProps) {
  return (
    <button
      id={id}
      role='switch'
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      }`}>
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
