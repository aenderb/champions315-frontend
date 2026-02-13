/**
 * Calcula a idade a partir da data de nascimento.
 *
 * @param birthDate  Data no formato "YYYY-MM-DD"
 * @param reference  Data de referência (padrão: hoje). Útil para calcular
 *                   a idade na data de uma partida futura.
 * @returns Idade em anos completos
 */
export function calcAge(birthDate: string, reference: Date = new Date()): number {
  const [year, month, day] = birthDate.split("-").map(Number);
  let age = reference.getFullYear() - year;

  const refMonth = reference.getMonth() + 1; // getMonth() é 0-based
  const refDay = reference.getDate();

  // Se ainda não fez aniversário neste ano, subtrai 1
  if (refMonth < month || (refMonth === month && refDay < day)) {
    age--;
  }

  return age;
}
