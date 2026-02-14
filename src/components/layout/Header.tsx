import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { onAuthExpired } from "../../api";
import { LoginPopup } from "../auth/LoginPopup";
import { RegisterPopup } from "../auth/RegisterPopup";
import { SuccessPopup } from "../auth/SuccessPopup";
import { compressImage } from "../../utils/image";
import logo315 from "../../assets/logo315.png";

type AuthPopup = "login" | "register" | "success" | null;

export function Header() {
  const { isLoggedIn, userName, userAvatar, login, register, logout, updateAvatar } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePopup, setActivePopup] = useState<AuthPopup>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Quando a sessão expirar, abre o popup de login com mensagem informativa
  useEffect(() => {
    return onAuthExpired(() => {
      setAuthError("Sua sessão expirou. Faça login novamente.");
      setActivePopup("login");
      navigate("/");
    });
  }, [navigate]);

  const handleAvatarUpload = async (file: File | undefined) => {
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      await updateAvatar(compressed);
    } catch (err) {
      console.error("Erro ao atualizar avatar:", err);
      alert(err instanceof Error ? err.message : "Erro ao atualizar foto");
    }
  };

  const closePopup = () => { setActivePopup(null); setAuthError(null); };

  const handleLoginLogout = async () => {
    if (isLoggedIn) {
      await logout();
      navigate("/");
    } else {
      setActivePopup("login");
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      setAuthError(null);
      await login(email, password);
      closePopup();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Erro ao fazer login");
    }
  };

  const handleRegister = async (name: string, email: string, password: string, avatar: string | null) => {
    try {
      setAuthError(null);
      // Converter base64 para File se necessário
      let avatarFile: File | undefined;
      if (avatar) {
        const res = await fetch(avatar);
        const blob = await res.blob();
        avatarFile = new File([blob], "avatar.jpg", { type: blob.type });
      }
      await register(name, email, password, avatarFile);
      closePopup();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Erro ao registrar");
    }
  };

  const navLinks = [
    { to: "/equipes", label: "Equipes" },
    { to: "/jogadores", label: "Jogadores" },
    { to: "/formacoes", label: "Formações" },
    { to: "/partidas", label: "Partidas" },
  ];

  const gameLink = { to: "/jogo", label: "Iniciar Jogo" };

  return (
    <>
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-white/10">
      <div className="w-full mx-auto px-2 pr-1 py-0.5 md:px-3 md:py-1 lg:px-10 lg:py-2 flex items-center justify-between flex-nowrap">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <div className="w-15 h-15 lg:w-20 lg:h-20 overflow-hidden rounded">
            <img src={logo315} alt="Logo 315" className="w-full h-full object-cover" />
          </div>
        </Link>

        {/* Nav desktop */}
        {isLoggedIn && (
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 flex-1 ml-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-1.5 text-xs lg:text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex-1" />
            <Link
              to={gameLink.to}
              className="px-4 py-1.5 text-xs lg:text-sm font-bold text-white visited:text-white bg-green-600 hover:bg-green-500 border border-green-500/50 rounded-xl transition-colors mr-20"
            >
              ⚽ {gameLink.label}
            </Link>
          </nav>
        )}

        {/* Login/Sair + Menu hamburger */}
        <div className="flex items-center gap-1 md:gap-2">
          {isLoggedIn && (
            <>
              {/* Time ativo - removido */}
              <div className="flex items-center gap-1 text-xs text-white/40">
              {userAvatar ? (
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="w-9 h-9 shrink-0 cursor-pointer hover:ring-2 hover:ring-green-400/50 rounded-full transition-all"
                  title="Trocar foto"
                >
                  <img src={userAvatar} alt="" className="w-9 h-9 rounded-full object-cover block" />
                </div>
              ) : (
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="w-9 h-9 rounded-full shrink-0 bg-white/10 flex items-center justify-center text-sm text-white/30 cursor-pointer hover:ring-2 hover:ring-green-400/50 transition-all"
                  title="Adicionar foto"
                >
                  👤
                </div>
              )}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { handleAvatarUpload(e.target.files?.[0]); if (avatarInputRef.current) avatarInputRef.current.value = ""; }}
              />
              <span className="hidden sm:inline">{userName}</span>
            </div>
            </>
          )}

          <button
            onClick={handleLoginLogout}
            className={`${isLoggedIn ? 'hidden md:inline-block' : ''} md:px-4 md:py-2 px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg transition-colors cursor-pointer border bg-white/10 hover:bg-white/20 text-gray-100 border-white/20`}
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
          <button
            onClick={() => { setMenuOpen(false); handleLoginLogout(); }}
            className="px-3 py-2 text-sm text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium text-left cursor-pointer pb-2 border-b border-white/10 mb-1"
          >
            Sair
          </button>
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
          <Link
            to={gameLink.to}
            onClick={() => setMenuOpen(false)}
            className="px-3 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-500 border border-green-500/50 rounded-lg transition-colors text-center mt-1"
          >
            ⚽ {gameLink.label}
          </Link>
        </nav>
      )}
    </header>

      {/* Auth popups */}
      <LoginPopup
        isOpen={activePopup === "login"}
        onClose={closePopup}
        onLogin={handleLogin}
        onSwitchToRegister={() => { setAuthError(null); setActivePopup("register"); }}
        errorMessage={authError}
      />
      <RegisterPopup
        isOpen={activePopup === "register"}
        onClose={closePopup}
        onRegister={handleRegister}
        onSwitchToLogin={() => { setAuthError(null); setActivePopup("login"); }}
        errorMessage={authError}
      />
      <SuccessPopup
        isOpen={activePopup === "success"}
        onClose={closePopup}
        onGoToLogin={() => setActivePopup("login")}
      />
    </>
  );
}
