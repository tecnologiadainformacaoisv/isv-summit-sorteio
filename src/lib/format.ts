// Conectivas de nomes em português que ficam em minúscula, exceto quando são
// a primeira palavra do nome (ex: "Maria de Souza", não "Maria De Souza").
const CONECTIVAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e'])

// Siglas que devem ficar sempre em caixa alta, nunca em Title Case — "ISV" é
// usado por gente do escritório do Instituto pra se identificar como equipe
// interna (ex: "Gabriela ISV"), não é uma palavra normal do nome.
const SIGLAS = new Set(['isv'])

/**
 * Padroniza um nome próprio em Title Case (inicial maiúscula por palavra),
 * respeitando conectivas em português e siglas conhecidas. Usada tanto na
 * importação da Sympla (supabase/functions/importar-sympla) quanto em
 * qualquer exibição futura — os dois lados mantêm essa MESMA lógica, copiada
 * (Deno não importa de src/ do frontend), então qualquer ajuste aqui precisa
 * refletir lá também.
 *
 * Não é infalível para casos muito específicos (ex: "McDonald", nomes com
 * apóstrofo) — cobre bem o caso comum de nomes brasileiros em CAIXA ALTA ou
 * caixa baixa vindos do formulário de inscrição.
 */
export function formatarNomeProprio(nome: string): string {
  return nome
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((palavra, indice) => {
      if (SIGLAS.has(palavra)) return palavra.toUpperCase()
      if (indice > 0 && CONECTIVAS.has(palavra)) return palavra
      return palavra.charAt(0).toUpperCase() + palavra.slice(1)
    })
    .join(' ')
}
