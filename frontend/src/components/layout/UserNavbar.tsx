import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { ChevronDown, Home, LogOut, Menu, User, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { api } from "../../api/client";
import { useAppDispatch, useAppSelector } from "../../app/hook";
import { logout } from "../../features/auth/authSlice";

import logo from "@/assets/olyvex-logo.png";
import { cn } from "@/lib/utils";

/*
 * Structural layout (sizes, grid/flex, visibility, overlay positioning) is set
 * with inline styles + a matchMedia hook, NOT utility classes, so it cannot be
 * broken by Tailwind/CSS ordering. Tailwind classes below are cosmetic only
 * (colors, borders, hover, focus).
 */

const NAV_ITEMS = [
  { label: "Home", to: "/", icon: Home },
  { label: "Profile", to: "/profile", icon: User },
] as const;

const NAVBAR_HEIGHT = 64;

function isActive(pathname: string, to: string) {
  /* "/" matches only the exact root so it is never active on /profile. */
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

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

/** Logo with an explicit, constrained width. Intrinsic image size is never used. */
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

/** Quiet initial badge: soft violet tint, no gradient. */
function UserAvatar({ initial }: { initial: string }) {
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
      {initial}
    </span>
  );
}

/**
 * Static UI representation of the current authenticated session.
 * Solid green dot + a slow expanding ring. Reduced motion: no animation,
 * just a faint static halo.
 */
function AccountStatus({ animate }: { animate: boolean }) {
  return (
    <span
      className="text-xs text-zinc-400"
      style={{ display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}
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

function UserNavbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const reduceMotion = useReducedMotion();

  const user = useAppSelector((state) => state.auth.user);

  /* md (768px) and lg (1024px) breakpoints. */
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isLarge = useMediaQuery("(min-width: 1024px)");

  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const sheetTriggerRef = useRef<HTMLButtonElement>(null);
  const sheetWasOpen = useRef(false);

  const displayName = user?.name?.trim() || user?.email || "";
  const initial = displayName.charAt(0).toUpperCase() || "?";

  const logoWidth = isLarge ? 140 : isDesktop ? 124 : 108;
  const sheetOpenNow = sheetOpen && !isDesktop;

  /* Same behavior as before. */
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post("/api/auth/logout");
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  /* Reaching the desktop breakpoint closes both overlays. */
  useEffect(() => {
    if (isDesktop) setSheetOpen(false);
    else setMenuOpen(false);
  }, [isDesktop]);

  /* User dropdown: close on outside press / Escape. */
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  /* Mobile sheet: scroll lock + Escape. */
  useEffect(() => {
    if (!sheetOpenNow) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [sheetOpenNow]);

  /* Focus management for the sheet. */
  useEffect(() => {
    if (sheetOpenNow) {
      closeBtnRef.current?.focus();
      sheetWasOpen.current = true;
    } else if (sheetWasOpen.current) {
      sheetTriggerRef.current?.focus();
      sheetWasOpen.current = false;
    }
  }, [sheetOpenNow]);

  const trapFocus = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !sheetRef.current) return;
    const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled])",
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const fade = reduceMotion ? { duration: 0 } : { duration: 0.15, ease: "easeOut" as const };

  /* ---------- Mobile overlay (portaled, fixed to the viewport) ---------- */
  const mobileSheet = (
    <AnimatePresence>
      {sheetOpenNow && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100 }}>
          <motion.div
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
            onClick={() => setSheetOpen(false)}
          />

          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            onKeyDown={trapFocus}
            initial={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            transition={
              reduceMotion ? { duration: 0 } : { duration: 0.25, ease: "easeOut" }
            }
            className="border-l border-zinc-800 shadow-2xl shadow-black/50"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(20rem, 85vw)",
              display: "flex",
              flexDirection: "column",
              background: "#0e0e11",
              overflowY: "auto",
            }}
          >
            <div
              className="border-b border-zinc-800"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: NAVBAR_HEIGHT,
                padding: "0 16px",
                flexShrink: 0,
              }}
            >
              <Logo width={108} />
              <button
                ref={closeBtnRef}
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Close menu"
                className="rounded-lg text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                }}
              >
                <X aria-hidden="true" size={20} />
              </button>
            </div>

            <nav
              aria-label="Main"
              style={{ display: "flex", flexDirection: "column", gap: 4, padding: 12 }}
            >
              {NAV_ITEMS.map(({ label, to, icon: Icon }) => {
                const active = isActive(pathname, to);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setSheetOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none",
                      active
                        ? "bg-white/8 text-white"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white",
                    )}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                    }}
                  >
                    <Icon
                      aria-hidden="true"
                      size={16}
                    />
                    {label}
                  </NavLink>
                );
              })}
            </nav>

            {user && (
              <div
                className="border-t border-zinc-800"
                style={{
                  marginTop: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  padding: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <UserAvatar initial={initial} />
                  <div style={{ minWidth: 0 }}>
                    <p className="truncate text-sm font-medium text-white">{displayName}</p>
                    <p className="truncate text-xs text-zinc-500">{user.email}</p>
                  </div>
                </div>
                <AccountStatus animate={!reduceMotion} />
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded-lg border border-zinc-800 text-sm text-zinc-200 transition-colors hover:bg-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none disabled:opacity-60"
                  style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "8px 12px",
                  }}
                >
                  <LogOut aria-hidden="true" size={16} />
                  {loggingOut ? "Logging out..." : "Log out"}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  /* ---------- Navbar ---------- */
  return (
    <>
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
        {/*
          Mobile: flex (logo left, hamburger right).
          md+: grid 1fr | auto | 1fr so the nav is centered on the card.
        */}
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
            display: isDesktop ? "grid" : "flex",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            justifyContent: "space-between",
            columnGap: 16,
          }}
        >
          {/* Left: brand */}
          <div style={{ display: "flex", alignItems: "center", minWidth: 0, justifySelf: "start" }}>
            <Link
              to="/"
              aria-label="Olyvex home"
              className="rounded-md focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
              style={{ display: "block", lineHeight: 0 }}
            >
              <Logo width={logoWidth} />
            </Link>
          </div>

          {/* Center: navigation (desktop / tablet only, not rendered on mobile) */}
          {isDesktop && (
            <nav aria-label="Main" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {NAV_ITEMS.map(({ label, to, icon: Icon }) => {
                const active = isActive(pathname, to);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-lg text-sm font-medium transition-[color,background-color,translate] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none",
                      active
                        ? "text-white"
                        : cn(
                            "text-zinc-400 hover:bg-white/5 hover:text-white",
                            !reduceMotion && "hover:-translate-y-px",
                          ),
                    )}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      height: 40,
                      padding: isLarge ? "0 16px" : "0 12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    
                    <Icon
                      aria-hidden="true"
                      size={16}
                      style={{ position: "relative" }}
                    />
                    <span style={{ position: "relative" }}>{label}</span>
                  </NavLink>
                );
              })}
            </nav>
          )}

          {/* Right: user menu (desktop / tablet) or hamburger (mobile) */}
          <div style={{ display: "flex", alignItems: "center", justifySelf: "end" }}>
            {isDesktop && user && (
              <div
                ref={menuRef}
                style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}
              >
                <AccountStatus animate={!reduceMotion} />

                <span
                  aria-hidden="true"
                  className="bg-zinc-800"
                  style={{ width: 1, height: 24 }}
                />
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label={`User menu, ${displayName}`}
                  className="rounded-xl transition-colors hover:bg-white/4 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 8px 4px 4px",
                  }}
                >
                  <UserAvatar initial={initial} />
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
                      aria-label="User menu"
                      initial={reduceMotion ? false : { opacity: 0, y: -4, scale: 0.98 }}
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
                        <UserAvatar initial={initial} />
                        <div style={{ minWidth: 0 }}>
                          <p className="truncate text-sm font-medium text-white">
                            {displayName}
                          </p>
                          <p className="truncate text-xs text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="border-t border-zinc-800" style={{ padding: 4 }}>
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
            )}

            {/* Hamburger: mobile only. Not rendered at >= 768px. */}
            {!isDesktop && (
              <button
                ref={sheetTriggerRef}
                type="button"
                onClick={() => setSheetOpen(true)}
                aria-label="Open menu"
                aria-haspopup="dialog"
                aria-expanded={sheetOpenNow}
                className="rounded-lg text-zinc-300 transition-colors hover:bg-white/6 hover:text-white focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:outline-none"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                }}
              >
                <Menu aria-hidden="true" size={20} />
              </button>
            )}
          </div>
        </div>
      </motion.header>

      {typeof document !== "undefined" && createPortal(mobileSheet, document.body)}
    </>
  );
}

export default UserNavbar