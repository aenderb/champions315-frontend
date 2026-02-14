/**
 * Calcula a idade a partir do ano de nascimento.
 * Considera apenas o ano, ignorando mês e dia.
 *
 * Ex: nascido em dez/2000, em 2026 já é considerado 26 anos.
 *
 * @param birthDate  Data no formato "YYYY-MM-DD"
 * @param reference  Data de referência (padrão: hoje).
 * @returns Idade baseada apenas no ano
 */
export function calcAge(birthDate: string, reference: Date = new Date()): number {
  const year = parseInt(birthDate.split("-")[0], 10);
  return reference.getFullYear() - year;
}
