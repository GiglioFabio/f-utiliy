interface CustomSliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string | React.ReactNode;
}

export function CustomSlider({ value, onChange, label }: CustomSliderProps) {
  return (
    <div className='w-full max-w-md px-4 py-6'>
      {label && (
        <label
          htmlFor='slider'
          className='block text-sm font-medium text-foreground mb-2'>
          {label ?? ''}
        </label>
      )}
      <input
        id='slider'
        type='range'
        min='0'
        max='100'
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`
            w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-background
            [&::-webkit-slider-thumb]:shadow
            [&::-webkit-slider-thumb]:transition-all
          `}
      />
    </div>
  );
}
