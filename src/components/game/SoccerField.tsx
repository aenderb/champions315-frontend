import type { LineupPlayers } from "../../types";
import type { FieldRole } from "../../types/api";
import { PlayerBadge } from "./PlayerBadge";
import { EmptySlotBadge } from "./EmptySlotBadge";
import { FieldRow } from "./FieldRow";
import { FieldMarkings } from "./FieldMarkings";

/** Calcula alinhamento lateral a partir do fieldRole do jogador */
function getFieldRoleAlign(fieldRole?: string): "start" | "center" | "end" | undefined {
  if (!fieldRole) return undefined;
  const leftRoles: FieldRole[] = ["LL", "LM", "LW", "LCB"];
  const rightRoles: FieldRole[] = ["RL", "RM", "RW", "RCB"];
  if (leftRoles.includes(fieldRole as FieldRole)) return "start";
  if (rightRoles.includes(fieldRole as FieldRole)) return "end";
  return "center";
}

/** Calcula alinhamento para uma linha com poucos jogadores */
function getRowAlign(players: (import("../../types").Player | null)[]): "start" | "center" | "end" | undefined {
  const nonNull = players.filter((p) => p !== null);
  if (nonNull.length !== 1) return undefined; // multiple players → justify-around handles it
  return getFieldRoleAlign(nonNull[0]?.fieldRole);
}

interface SoccerFieldProps {
  players: LineupPlayers;
  color: string;
  yellowCardIds: Set<string>;
  onRemoveFromField: (group: "gk" | "defenders" | "midfielders" | "attackers", idx: number) => void;
  /** Destaca jogadores de linha como selecionáveis (fluxo de goleiro expulso) */
  highlightFieldPlayers?: boolean;
}

export function SoccerField({ players, color, yellowCardIds, onRemoveFromField, highlightFieldPlayers }: SoccerFieldProps) {
  return (
    <div className="flex-1 min-h-0 flex items-center justify-center lg:w-[70%] overflow-hidden">
    <div className="relative h-full aspect-[10/13] md:aspect-[10/12] landscape:aspect-[16/9] landscape:w-full landscape:h-auto lg:aspect-auto lg:h-full lg:w-full max-w-full rounded-xl md:rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">

      {/* Faixas de grama - retrato (portrait only) */}
      <div className="absolute inset-0 landscape:hidden lg:hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="w-full"
            style={{
              height: `${100 / 8}%`,
              backgroundColor: i % 2 === 0 ? "#2d8a4e" : "#25753f",
            }}
          />
        ))}
      </div>

      {/* Faixas de grama - paisagem (landscape + desktop) */}
      <div className="absolute inset-0 hidden landscape:flex landscape:flex-row lg:flex lg:flex-row">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="h-full"
            style={{
              width: `${100 / 14}%`,
              backgroundColor: i % 2 === 0 ? "#2d8a4e" : "#25753f",
            }}
          />
        ))}
      </div>

      <FieldMarkings />

      {/* Jogadores */}
      {/* Jogadores de linha */}
      <div className="absolute inset-0 flex flex-col landscape:flex-row-reverse lg:flex-row-reverse justify-evenly gap-2 pt-[10%] pb-[3%] md:gap-0 md:pt-[12%] md:pb-[2%] landscape:pt-[2%] landscape:pb-[2%] landscape:pl-[12%] landscape:pr-[10%] lg:pt-[2%] lg:pb-[2%] lg:pl-[12%] lg:pr-[10%]">
        <FieldRow
          players={players.attackers}
          color={color}
          yellowCardIds={yellowCardIds}
          onPlayerClick={(idx) => onRemoveFromField("attackers", idx)}
          align={getRowAlign(players.attackers)}
          highlight={highlightFieldPlayers}
        />
        <FieldRow
          players={players.midfielders}
          color={color}
          yellowCardIds={yellowCardIds}
          onPlayerClick={(idx) => onRemoveFromField("midfielders", idx)}
          highlight={highlightFieldPlayers}
        />
        <FieldRow
          players={players.defenders}
          color={color}
          yellowCardIds={yellowCardIds}
          onPlayerClick={(idx) => onRemoveFromField("defenders", idx)}
          highlight={highlightFieldPlayers}
        />
        <div className="flex justify-center landscape:hidden lg:hidden">
          {players.gk ? (
            <PlayerBadge
              player={players.gk}
              color="#eab308"
              onClick={() => onRemoveFromField("gk", -1)}
              hasYellowCard={yellowCardIds.has(players.gk.id)}
            />
          ) : (
            <EmptySlotBadge />
          )}
        </div>
      </div>

      {/* Goleiro posicionado no gol (landscape + desktop) */}
      <div className="hidden landscape:flex lg:flex absolute left-[2%] top-0 bottom-0 items-center">
        {players.gk ? (
          <PlayerBadge
            player={players.gk}
            color="#eab308"
            onClick={() => onRemoveFromField("gk", -1)}
            hasYellowCard={yellowCardIds.has(players.gk.id)}
          />
        ) : (
          <EmptySlotBadge />
        )}
      </div>
    </div>
    </div>
  );
}
