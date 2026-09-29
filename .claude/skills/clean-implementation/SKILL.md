---
name: clean-implementation
description: >-
  Implementa só o pedido, sem AI slop (hints explicativos, copy tutoriais,
  campos extras, ultra-descrições). Use ao criar/editar UI, formulários,
  páginas, componentes, copy, features ou qualquer implementação de produto;
  também após concluir uma solicitação para validar com testes retroativos.
---

# Clean Implementation

Padrão de implementação enxuta: entregue a funcionalidade pedida e nada além.

## Princípio

1. Leia o pedido e liste o escopo mínimo (campos, fluxos, textos).
2. Implemente **somente** esse escopo.
3. Antes de considerar pronto, rode a validação retroativa abaixo.
4. Se algo útil parecer “extra”, **pergunte** — não adicione.

## Proibido (AI slop)

Não invente:

| Tipo | Exemplos |
|------|----------|
| Hints / microcopy tutoriais | Explicar como o campo “funciona” ou o que acontece se vazio/preenchido |
| Ultra-descrições | Parágrafos sob labels, legendas longas, tooltips óbvios |
| Campos não pedidos | Inputs, toggles, seções, estados, validações extras |
| Placeholders verbosos | Frases de ajuda no lugar de exemplo curto |
| Empty states narrativos | Textos que ensinam o produto em vez de um estado mínimo |
| Comentários/docs de “marketing” | JSDoc ou README explicando o óbvio da feature |

### Exemplo real — não fazer

Pedido: campos de Instagram/Facebook no formulário de perfil.

```tsx
// ❌ AI slop — texto tutorial não solicitado
<p className="sp-field__hint">
  Nas redes, use o nome de usuário ou o link da página. Cada campo
  preenchido liga o botão correspondente no seu perfil. Vazio, o botão
  só avisa que o contato não foi informado.
</p>
```

```tsx
// ✅ Só o necessário: label + input (+ placeholder curto se o padrão do projeto já usa)
<label htmlFor="pf-insta">Instagram</label>
<input id="pf-insta" placeholder="@usuario" ... />
```

### Copy permitida

- Labels curtos (1–3 palavras) alinhados ao restante da tela
- Placeholders **só** se o projeto já usa e forem exemplos mínimos (`@usuario`, `5551…`)
- Mensagens de erro/sucesso **só** se o fluxo pedir ou o padrão existente exigir
- `aria-label` / textos de acessibilidade quando o controle não tem label visível

Se o usuário não pediu o texto, não escreva o texto.

## Escopo estrito

Antes de editar:

```
Pedido → [ ] campos  [ ] ações  [ ] rotas/API  [ ] copy explícita
Fora   → tudo que não está na lista (perguntar ou omitir)
```

Regras:

- Não “completar” a feature com UX educativa.
- Não espelhar campos “simétricos” (ex.: pediu Instagram → não inventar TikTok).
- Não adicionar empty-state, onboarding, confirmação extra, toast, modal ou hint sem pedido.
- Reutilize padrões visuais/componentes existentes; não introduza novo padrão de ajuda.
- Prefira silêncio: campo vazio sem sermão; botão desabilitado ou comportamento já existente no código.

## Checklist antes de entregar

- [ ] Cada linha de UI/copy nova foi pedida ou já existia no padrão da tela?
- [ ] Removi hints, `<p class="…hint">`, tooltips e descrições que eu mesmo inventei?
- [ ] Não há campos, props, rotas ou estados “por precaução”?
- [ ] Diff bate com o escopo mínimo listado no início?

Se algum item falhar → remova o excesso antes de testar.

## Validação retroativa (obrigatória ao concluir)

Depois da implementação, valide se a funcionalidade ficou **de acordo com o pedido** — não se ficou “mais completa”.

### 1. Critérios de aceite (do pedido)

Reescreva o pedido em 2–5 asserts falsificáveis, por exemplo:

- Dado perfil com Instagram preenchido, o botão Instagram no perfil abre/usa esse valor.
- Dado Instagram vazio, o comportamento é o já existente no código (sem texto novo de aviso inventado).
- Formulário salva/persiste só os campos pedidos.

### 2. Como testar (nessa ordem)

1. **Estático**: releia o diff; corte qualquer copy/campo fora dos asserts.
2. **Automatizado**: rode testes existentes que cubram a área; se o projeto já tem harness (unit/RTL/e2e), adicione ou ajuste **só** o mínimo para os asserts acima — sem suíte narrativa.
3. **Manual / browser** (quando UI): caminho feliz + 1 caso vazio/erro relevante ao pedido.
4. **Regressão rápida**: abra a tela/fluxo vizinho que você tocou e confirme que não quebrou.

### 3. Relato curto ao usuário

Ao terminar, diga em poucas linhas:

- O que foi feito (escopo)
- Como validou (comando de teste e/ou passos manuais)
- O que **não** foi adicionado de propósito (se houver tentação óbvia)

Não entregue como pronto sem pelo menos o passo estático + (teste automatizado **ou** verificação manual).

## Anti-padrões rápidos

| Pedido | Resposta errada | Resposta certa |
|--------|-----------------|----------------|
| “Campo WhatsApp” | Hint explicando o botão do perfil | Input + label |
| “Salvar perfil” | Modal de dicas + checklist de preenchimento | Submit + feedback já usado na tela |
| “Lista de serviços” | Intro “Aqui você gerencia…” | Lista (e CTA só se pedido) |
| “Corrigir bug X” | Refactor + novos campos “já que estamos aqui” | Só o fix |

## Quando duvidar

Pergunte em uma frase: “Incluo também [X]?” — default é **não**.
