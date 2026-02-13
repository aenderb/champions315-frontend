import type { ApiLineup } from "../../types/api";

/**
 * Escalações criadas pelo coach.
 *
 * Formação fixa: 4-3-1 (GK + 4 DEF + 3 MID + 1 FWD = 9 titulares)
 * Regra: soma das idades dos 9 titulares ≥ 315
 *
 * Titulares (IDs):
 *   GK:  p-01 (Marcos, 42)
 *   DEF: p-03 (Cafu, 44), p-04 (Lúcio, 39), p-05 (Roque Jr, 38), p-06 (R. Carlos, 43)
 *   MID: p-08 (Gilberto, 36), p-09 (Kaká, 34), p-10 (Rivaldo, 45)
 *   FWD: p-13 (Ronaldo, 41)
 *
 * Soma: 42+44+39+38+43+36+34+45+41 = 362 ✅ (≥ 315)
 *
 * Banco: p-02, p-07, p-11, p-12, p-14, p-15
 */
export const mockLineups: ApiLineup[] = [
  {
    id: "lineup-1",
    teamId: "team-1",
    name: "Escalação principal",
    formation: "4-3-1",
    starterIds: [
      "p-01", // GK: Marcos
      "p-03", // DEF: Cafu
      "p-04", // DEF: Lúcio
      "p-05", // DEF: Roque Jr
      "p-06", // DEF: R. Carlos
      "p-08", // MID: Gilberto
      "p-09", // MID: Kaká
      "p-10", // MID: Rivaldo
      "p-13", // FWD: Ronaldo
    ],
    benchIds: ["p-02", "p-07", "p-11", "p-12", "p-14", "p-15"],
    createdAt: "2026-02-10T10:00:00",
  },
  {
    id: "lineup-2",
    teamId: "team-1",
    name: "Escalação reserva",
    formation: "4-3-1",
    starterIds: [
      "p-02", // GK: Dida
      "p-07", // DEF: Belletti
      "p-04", // DEF: Lúcio
      "p-05", // DEF: Roque Jr
      "p-06", // DEF: R. Carlos
      "p-11", // MID: Kléberson
      "p-09", // MID: Kaká
      "p-10", // MID: Rivaldo
      "p-12", // FWD: Denílson
    ],
    benchIds: ["p-01", "p-03", "p-08", "p-13", "p-14", "p-15"],
    createdAt: "2026-02-11T14:00:00",
  },
];

