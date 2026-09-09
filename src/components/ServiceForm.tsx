import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { ServiceDraft } from '../context/ServicesProvider';
import { useMeta } from '../context/CatalogProvider';
import { formatPrice } from '../lib/pricing';
import type { PriceType, ServiceMode } from '../types';
import { PRICE_TYPES, SERVICE_MODES } from '../types';
import { ImageSlot } from './ImageSlot';

interface ServiceFormProps {
  initial?: Partial<ServiceDraft>;
  submitLabel: string;
  onSubmit: (draft: ServiceDraft) => void;
  /** Where "Cancelar" goes. */
  cancelTo: string;
}

const PHOTO_SLOTS = [1, 2, 3];

/** Shared by "Cadastrar serviço" and "Editar serviço" — same fields, same rules. */
export function ServiceForm({
  initial,
  submitLabel,
  onSubmit,
  cancelTo,
}: ServiceFormProps) {
  const { serviceCategories: SERVICE_CATEGORIES } = useMeta();
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState(
    initial?.category ?? SERVICE_CATEGORIES[0] ?? '',
  );
  const [description, setDescription] = useState(initial?.description ?? '');
  const [mode, setMode] = useState<ServiceMode>(initial?.mode ?? 'Em domicílio');
  const [priceType, setPriceType] = useState<PriceType>(
    initial?.priceType ?? 'A partir de',
  );
  const [priceAmount, setPriceAmount] = useState(initial?.priceAmount ?? '');
  const [touched, setTouched] = useState(false);

  const nameError = touched && name.trim() === '';

  const submit = () => {
    setTouched(true);
    if (name.trim() === '') return;
    onSubmit({
      name: name.trim(),
      category,
      description: description.trim(),
      mode,
      priceType,
      priceAmount: priceType === 'Sob consulta' ? '' : priceAmount.trim(),
    });
  };

  return (
    <form
      className="sp-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="sp-field">
        <label className="sp-field__label" htmlFor="svc-name">
          Nome do serviço
        </label>
        <input
          id="svc-name"
          className={`sp-input${nameError ? ' sp-input--error' : ''}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="Instalação elétrica residencial"
          aria-invalid={nameError}
          aria-describedby={nameError ? 'svc-name-error' : undefined}
        />
        {nameError && (
          <p className="sp-field__error" id="svc-name-error">
            Dê um nome ao serviço para publicá-lo.
          </p>
        )}
      </div>

      <div className="sp-field">
        <label className="sp-field__label" htmlFor="svc-cat">
          Categoria
        </label>
        <select
          id="svc-cat"
          className="sp-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {SERVICE_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="sp-field">
        <label className="sp-field__label" htmlFor="svc-desc">
          Descrição
        </label>
        <textarea
          id="svc-desc"
          className="sp-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Instalações e manutenção elétrica residencial."
        />
        <p className="sp-field__hint">Aparece abaixo do nome no seu perfil.</p>
      </div>

      <fieldset className="sp-fieldset">
        <legend className="sp-field__label sp-field__label--roomy">
          Forma de atendimento
        </legend>
        <div className="sp-chiprow">
          {SERVICE_MODES.map((option) => (
            <button
              key={option}
              type="button"
              className={`sp-chip sp-chip--form${mode === option ? ' sp-chip--on' : ''}`}
              aria-pressed={mode === option}
              onClick={() => setMode(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="sp-fieldset">
        <legend className="sp-field__label sp-field__label--roomy">
          Preço (opcional)
        </legend>
        <div className="sp-chiprow">
          {PRICE_TYPES.map((option) => (
            <button
              key={option}
              type="button"
              className={`sp-chip sp-chip--form${priceType === option ? ' sp-chip--on' : ''}`}
              aria-pressed={priceType === option}
              onClick={() => setPriceType(option)}
            >
              {option}
            </button>
          ))}
        </div>
        {priceType !== 'Sob consulta' && (
          <input
            className="sp-input sp-priceinput"
            type="number"
            min="0"
            inputMode="numeric"
            value={priceAmount}
            onChange={(e) => setPriceAmount(e.target.value)}
            placeholder="150"
            aria-label="Valor em reais"
          />
        )}
        <p className="sp-field__hint">
          Aparecerá como <strong>{formatPrice(priceType, priceAmount)}</strong>.
        </p>
      </fieldset>

      <div className="sp-field">
        <span className="sp-field__label sp-field__label--roomy">
          Fotos do serviço
        </span>
        <div className="sp-photogrid">
          {PHOTO_SLOTS.map((n) => (
            <ImageSlot
              key={n}
              className="sp-photogrid__cell"
              placeholder="Adicionar foto"
              radius={14}
              editable
            />
          ))}
        </div>
        <p className="sp-field__hint">
          Pré-visualização apenas — o envio de arquivos depende do servidor.
        </p>
      </div>

      <div className="sp-form__actions">
        <button type="submit" className="sp-btn sp-btn--primary sp-btn--lg">
          {submitLabel}
        </button>
        <Link className="sp-btn sp-btn--outline sp-btn--lg" to={cancelTo}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
