import type { Player } from "../../types";
import { PlayerBadge } from "./PlayerBadge";
import { EmptySlotBadge } from "./EmptySlotBadge";

interface FieldRowProps {
  players: (Player | null)[];
  color: string;
  yellowCardIds: Set<string>;
  onPlayerClick: (index: number) => void;
  /** Alinhamento lateral: posiciona o jogador na linha conforme fieldRole */
  align?: "start" | "center" | "end";
}

const ALIGN_CLASS = {
  start:  "justify-start",
  center: "justify-center",
  end:    "justify-end",
} as const;

export function FieldRow({ players, color, yellowCardIds, onPlayerClick, align }: FieldRowProps) {
  const justifyClass = align ? ALIGN_CLASS[align] : "justify-around";
  return (
    <div className={`flex ${justifyClass} items-center w-full px-2 sm:px-4 md:px-8 landscape:flex-col landscape:w-auto landscape:h-full landscape:px-0 landscape:py-1 lg:flex-col lg:w-auto lg:h-full lg:px-0 lg:py-2`}>
      {players.map((player, idx) =>
        player ? (
          <PlayerBadge
            key={player.number}
            player={player}
            color={color}
            onClick={() => onPlayerClick(idx)}
            hasYellowCard={yellowCardIds.has(player.id)}
          />
        ) : (
          <EmptySlotBadge key={`empty-${idx}`} />
        )
      )}
    </div>
  );
}
