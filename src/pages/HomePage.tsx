import { useAuth } from "../contexts/AuthContext";

const sponsors = [
  { name: "Patrocinador 1", logo: "🏪", description: "Apoio oficial do campeonato" },
  { name: "Patrocinador 2", logo: "🏢", description: "Parceiro esportivo" },
  { name: "Patrocinador 3", logo: "🏬", description: "Fornecedor de materiais" },
];

export function HomePage() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      {/* Patrocinadores */}
      <div className="max-w-3xl mx-auto mb-8 md:mb-12">
        <h2 className="text-lg md:text-xl font-bold text-white mb-4 text-center">🤝 Patrocinadores</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.name}
              className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 text-center hover:bg-white/10 transition-colors"
            >
              <span className="text-4xl md:text-5xl block mb-3">{sponsor.logo}</span>
              <h3 className="text-white font-semibold text-sm md:text-base mb-1">{sponsor.name}</h3>
              <p className="text-white/40 text-xs md:text-sm">{sponsor.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4">
          ⚽ Campeonato 315
        </h1>
        <p className="text-white/60 text-sm md:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
          O Campeonato 315 é uma competição de futebol amador onde a soma das idades dos jogadores
          em campo deve ser igual ou superior a 315 anos. Uma regra que valoriza a experiência
          e promove a inclusão de jogadores veteranos no esporte.
        </p>
        {isLoggedIn && (
          <p className="text-green-400/80 text-xs md:text-sm mt-3">
            Utilize o menu acima para cadastrar sua equipe, jogadores, formações e iniciar um jogo.
          </p>
        )}
      </div>

      {/* Regras resumidas */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-white mb-3">📋 Regras Principais</h2>
          <ul className="text-white/60 text-sm md:text-base space-y-2">
           
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              <span>Soma das idades dos 9 jogadores em campo deve ser ≥ 315 anos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              <span>Em caso de expulsão, a média de idade deve ser ≥ 35 anos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">•</span>
              <span>3 tempos de 20 minutos cada</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
