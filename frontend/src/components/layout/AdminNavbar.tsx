import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronDown, LogOut } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { useAppDispatch } from "../../app/hook";
import { logoutAdmin } from "../../features/admin/adminAuthSlice";
import { api } from "../../api/client";

import logo from "@/assets/olyvex-logo.png";

const NAVBAR_HEIGHT = 64;

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

function Logo({ width }: { width: number }) {
  return (
    <span
      style={{
        display: "block",
        width,
        maxWidth: "100%",
        flexShrink: 0,
        lineHeight: 0,
        overflow: "hidden",
      }}
    >
      <img
        src={logo}
        alt="Olyvex"
        draggable={false}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          maxWidth: "100%",
          aspectRatio: "1200 / 402",
          userSelect: "none",
        }}
      />
    </span>
  );
}

function AdminAvatar() {
  return (
    <span
      aria-hidden="true"
      className="rounded-full bg-[#9E7AFF]/20 text-sm font-medium text-white ring-1 ring-[#9E7AFF]/30"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        flexShrink: 0,
      }}
    >
      A
    </span>
  );
}

function AccountStatus({ animate }: { animate: boolean }) {
  return (
    <span
      className="text-xs text-zinc-400"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "relative",
          display: "block",
          width: 8,
          height: 8,
          flexShrink: 0,
          borderRadius: 9999,
          background: "#22c55e",
          boxShadow: animate ? undefined : "0 0 0 3px rgba(34,197,94,0.18)",
        }}
      >
        {animate && (
          <motion.span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 9999,
              background: "#22c55e",
            }}
            animate={{ scale: [1, 2.6], opacity: [0.45, 0] }}
            transition={{ duration: 2.2, ease: "easeOut", repeat: Infinity }}
          />
        )}
      </span>
      ACTIVE
    </span>
  );
}

function AdminNavbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isLarge = useMediaQuery("(min-width: 1024px)");

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const logoWidth = isLarge ? 140 : isDesktop ? 124 : 108;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post("/api/admin/logout");
    } finally {
      dispatch(logoutAdmin());
      navigate("/admin/login", { replace: true });
    }
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const fade = reduceMotion
    ? { duration: 0 }
    : { duration: 0.15, ease: "easeOut" as const };

  return (
    <motion.header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        padding: isLarge ? "12px 24px 0" : "12px 16px 0",
      }}
      initial={reduceMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div
        className="rounded-2xl border border-white/10 shadow-lg shadow-black/30"
        style={{
          backgroundColor: "rgba(9, 9, 11, 0.5)",
          backdropFilter: "blur(16px) saturate(1.1)",
          WebkitBackdropFilter: "blur(16px) saturate(1.1)",
          width: "100%",
          maxWidth: 1280,
          height: NAVBAR_HEIGHT,
          margin: "0 auto",
          padding: isDesktop ? "0 20px" : "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          columnGap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
          <Link
            to="/admin/users"
            aria-label="Olyvex admin"
            className="rounded-md focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
            style={{ display: "block", lineHeight: 0 }}
          >
            <Logo width={logoWidth} />
          </Link>
        </div>

        <div
          ref={menuRef}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          {isDesktop && (
            <>
              <AccountStatus animate={!reduceMotion} />
              <span
                aria-hidden="true"
                className="bg-zinc-800"
                style={{ width: 1, height: 24 }}
              />
            </>
          )}

          <button
            ref={triggerRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Admin menu"
            className="rounded-xl transition-colors hover:bg-white/4 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 8px 4px 4px",
            }}
          >
            <AdminAvatar />
            <ChevronDown
              aria-hidden="true"
              size={16}
              className="text-zinc-500 transition-transform"
              style={{ transform: menuOpen ? "rotate(180deg)" : undefined }}
            />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                role="menu"
                aria-label="Admin menu"
                initial={
                  reduceMotion ? false : { opacity: 0, y: -4, scale: 0.98 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={fade}
                className="overflow-hidden rounded-xl border border-zinc-800 bg-[#0e0e11] shadow-2xl shadow-black/50"
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: 12,
                  width: 256,
                  maxWidth: "calc(100vw - 32px)",
                  zIndex: 50,
                  transformOrigin: "top right",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                  }}
                >
                  <AdminAvatar />
                  <div style={{ minWidth: 0 }}>
                    <p className="truncate text-sm font-medium text-white">
                      Admin
                    </p>
                    {isDesktop ? (
                      <p className="truncate text-xs text-zinc-500">
                        Olyvex Admin
                      </p>
                    ) : (
                      <AccountStatus animate={!reduceMotion} />
                    )}
                  </div>
                </div>
                <div
                  className="border-t border-zinc-800"
                  style={{ padding: 4 }}
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="rounded-md text-sm text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white focus-visible:bg-zinc-900 focus-visible:outline-none disabled:opacity-60"
                    style={{
                      display: "flex",
                      width: "100%",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                    }}
                  >
                    <LogOut aria-hidden="true" size={16} />
                    {loggingOut ? "Logging out..." : "Log out"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}

export default AdminNavbar;
