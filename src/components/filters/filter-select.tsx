import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ALL = "__all__";

export interface Option {
  value: string;
  label: string;
}

interface FilterSelectProps {
  id: string;
  label: string;
  allLabel: string;
  options: Option[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

export function FilterSelect({ id, label, allLabel, options, value, onChange }: FilterSelectProps) {
  const items = [{ value: ALL, label: allLabel }, ...options];
  return (
    <Field className="min-w-0">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        items={items}
        value={value ?? ALL}
        onValueChange={(next) => onChange(next === ALL || next === null ? undefined : String(next))}
      >
        <SelectTrigger id={id} size="sm" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
