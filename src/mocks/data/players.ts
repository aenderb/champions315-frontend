import type { ApiPlayer } from "../../types/api";

/**
 * Elenco completo do time do coach.
 * 15 jogadores cadastrados → 9 titulares + 6 reservas.
 *
 * Idades pensadas para que a soma dos 9 titulares ≥ 315.
 */
export const mockPlayers: ApiPlayer[] = [
  // Goleiros (2)
  { id: "p-01", teamId: "team-1", number: 1,  name: "Marcos",      birthDate: "1984-02-07", position: "GK"  },  // 42
  { id: "p-02", teamId: "team-1", number: 12, name: "Dida",        birthDate: "1986-01-22", position: "GK"  },  // 40

  // Defensores (5)
  { id: "p-03", teamId: "team-1", number: 2,  name: "Cafu",        birthDate: "1982-01-07", position: "DEF" },  // 44
  { id: "p-04", teamId: "team-1", number: 3,  name: "Lúcio",       birthDate: "1995-02-08", position: "DEF" },  // 31
  { id: "p-05", teamId: "team-1", number: 4,  name: "Roque Jr",    birthDate: "1996-01-31", position: "DEF" },  // 30
  { id: "p-06", teamId: "team-1", number: 6,  name: "R. Carlos",   birthDate: "1983-02-10", position: "DEF" },  // 43
  { id: "p-07", teamId: "team-1", number: 13, name: "Belletti",    birthDate: "1989-01-20", position: "DEF" },  // 37

  // Meias (4)
  { id: "p-08", teamId: "team-1", number: 5,  name: "Gilberto",    birthDate: "1998-02-07", position: "MID" },  // 28
  { id: "p-09", teamId: "team-1", number: 8,  name: "Kaká",        birthDate: "1999-01-22", position: "MID" },  // 27
  { id: "p-10", teamId: "team-1", number: 10, name: "Rivaldo",     birthDate: "1981-01-19", position: "MID" },  // 45
  { id: "p-11", teamId: "team-1", number: 15, name: "Kléberson",   birthDate: "2000-01-19", position: "MID" },  // 26

  // Atacantes (4)
  { id: "p-12", teamId: "team-1", number: 7,  name: "Denílson",    birthDate: "1986-01-24", position: "FWD" },  // 40
  { id: "p-13", teamId: "team-1", number: 9,  name: "Ronaldo",     birthDate: "1985-02-01", position: "FWD" },  // 41
  { id: "p-14", teamId: "team-1", number: 11, name: "Ronaldinho",  birthDate: "1997-01-21", position: "FWD" },  // 29
  { id: "p-15", teamId: "team-1", number: 16, name: "Juninho P.",  birthDate: "1984-01-30", position: "FWD" },  // 42
];

