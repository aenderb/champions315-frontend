import type { ApiTeam } from "../../types/api";

/**
 * Time cadastrado pelo coach.
 * No app real, 1 coach = 1 time. Aqui temos 1 mock.
 */
export const mockTeam: ApiTeam = {
  id: "team-1",
  coachId: "coach-1",
  name: "Esquadrão Veteranos",
  color: "#fff",
  year: 2020,
  sponsor: "Patrocinador Exemplo",
};

