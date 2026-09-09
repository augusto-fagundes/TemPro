import { FilterMenu } from './FilterMenu';

export const OTHER_CATEGORY = 'Outro';

interface CategoryFieldProps {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function CategoryField({
  categories,
  value,
  onChange,
  label = 'Categoria',
}: CategoryFieldProps) {
  const listed = categories.includes(value);
  const selected = !value ? [] : listed ? [value] : [OTHER_CATEGORY];
  const custom = listed || !value ? '' : value;
  const options = [
    ...categories.map((name) => ({ value: name, label: name })),
    { value: OTHER_CATEGORY, label: OTHER_CATEGORY },
  ];

  return (
    <div className="sp-field">
      <span className="sp-field__label">{label}</span>
      <FilterMenu
        variant="field"
        label={label}
        summary={
          !value
            ? 'Selecione'
            : listed
              ? value
              : custom && custom !== OTHER_CATEGORY
                ? custom
                : OTHER_CATEGORY
        }
        selected={selected}
        options={options}
        onChange={(next) => {
          const picked = next[0] ?? '';
          if (picked === OTHER_CATEGORY) {
            onChange(custom || OTHER_CATEGORY);
            return;
          }
          onChange(picked);
        }}
      />
      {selected[0] === OTHER_CATEGORY && (
        <input
          className="sp-input"
          style={{ marginTop: 10 }}
          value={custom === OTHER_CATEGORY ? '' : custom}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Qual categoria?"
          aria-label="Outra categoria"
          required
        />
      )}
    </div>
  );
}
