import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import { LoginPopup } from "../auth/LoginPopup";
import { RegisterPopup } from "../auth/RegisterPopup";
import { SuccessPopup } from "../auth/SuccessPopup";
import logo315 from "../../assets/logo315.png";

type AuthPopup = "login" | "register" | "success" | null;

export function Header() {
  const { isLoggedIn, coachName, coachAvatar, login, logout } = useAuth();
  const { activeTeam } = useData();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePopup, setActivePopup] = useState<AuthPopup>(null);

  const closePopup = () => setActivePopup(null);

  const handleLoginLogout = () => {
    if (isLoggedIn) {
      logout();
      navigate("/");
    } else {
      setActivePopup("login");
    }
  };

  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState<string | null>(null);

  const handleLogin = (email: string, _password: string) => {
    // TODO: autenticação real
    const name = pendingName ?? email.split("@")[0];
    login(name, pendingAvatar);
    setPendingAvatar(null);
    setPendingName(null);
    closePopup();
  };

  const handleRegister = (name: string, _email: string, _password: string, avatar: string | null) => {
    // TODO: registro real
    setPendingAvatar(avatar);
    setPendingName(name);
    setActivePopup("success");
  };

  const navLinks = [
    { to: "/equipes", label: "Equipes" },
    { to: "/jogadores", label: "Jogadores" },
    { to: "/formacoes", label: "Formações" },
    { to: "/jogo", label: "Iniciar Jogo" },
  ];

  return (
    <>
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-white/10">
      <div className="w-full mx-auto px-2 py-0.5 md:px-3 md:py-1 lg:px-10 lg:py-2 flex items-center justify-between flex-nowrap">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <div className="w-15 h-15 lg:w-20 lg:h-20 overflow-hidden rounded">
            <img src={logo315} alt="Logo 315" className="w-full h-full object-cover" />
          </div>
        </Link>

        {/* Nav desktop */}
        {isLoggedIn && (
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-1.5 text-xs lg:text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Login/Sair + Menu hamburger */}
        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              {activeTeam && (
                <>
                  <div
                    className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: activeTeam.color }}
                  />
                  <span className="hidden sm:inline truncate max-w-20">{activeTeam.name}</span>
                  <span className="hidden sm:inline text-white/20">·</span>
                </>
              )}
              {coachAvatar ? (
                <img src={coachAvatar} alt="" className="w-6 h-6 rounded-full object-cover border border-white/20 shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 shrink-0 flex items-center justify-center text-[10px] text-white/30">👤</div>
              )}
              <span>{coachName}</span>
            </div>
          )}

          <button
            onClick={handleLoginLogout}
            className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold rounded-lg transition-colors cursor-pointer border bg-white/10 hover:bg-white/20 text-gray-100 border-white/20"
          >
            {isLoggedIn ? "Sair" : "Entrar"}
          </button>

          {/* Hamburger mobile */}
          {isLoggedIn && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1 bg-white/10 rounded-lg cursor-pointer"
            >
              <span className={`block w-4 h-0.5 bg-white/70 transition-transform ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`}></span>
              <span className={`block w-4 h-0.5 bg-white/70 transition-opacity ${menuOpen ? "opacity-0" : ""}`}></span>
              <span className={`block w-4 h-0.5 bg-white/70 transition-transform ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}></span>
            </button>
          )}
        </div>
      </div>

      {/* Menu mobile dropdown */}
      {isLoggedIn && menuOpen && (
        <nav className="md:hidden border-t border-white/10 bg-gray-800/90 backdrop-blur-sm px-3 py-2 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>

      {/* Auth popups */}
      <LoginPopup
        isOpen={activePopup === "login"}
        onClose={closePopup}
        onLogin={handleLogin}
        onSwitchToRegister={() => setActivePopup("register")}
      />
      <RegisterPopup
        isOpen={activePopup === "register"}
        onClose={closePopup}
        onRegister={handleRegister}
        onSwitchToLogin={() => setActivePopup("login")}
      />
      <SuccessPopup
        isOpen={activePopup === "success"}
        onClose={closePopup}
        onGoToLogin={() => setActivePopup("login")}
      />
    </>
  );
}
