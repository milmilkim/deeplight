
import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import type * as SelectPrimitive from '@radix-ui/react-select';

export interface Option {
  label: string;
  value: string;
}

const Select = ({
  className,
  options,
  placeholder,
  ...rest
}: React.ComponentProps<typeof SelectPrimitive.Root> & {
  className?: string;
  options: Option[];
  placeholder: string;
}) => {
  return (
    <SelectRoot {...rest}>
      <SelectTrigger className={cn('w-[180px]', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};

interface PSelectProps {
  className?: string;
  controlled?: boolean;
  name?: string;
  onChange?: (value: string) => void;
  options: Option[];
  defaultValue?: string;
  placeholder?: string;
  value?: string;
  disalbed?: boolean;
}
const PSelect = ({
  className,
  onChange,
  options,
  defaultValue,
  value,
  placeholder = 'Select an option',
  ...rest
}: PSelectProps) => {

  return (
    <Select
      defaultValue={defaultValue}
      onValueChange={onChange}
      className={className}
      options={options}
      placeholder={placeholder}
      value={value}
      {...rest}
    />
  );
};

export default PSelect;
