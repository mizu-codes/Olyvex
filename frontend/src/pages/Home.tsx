import { useReducedMotion } from "motion/react";

import UserNavbar from "../components/layout/UserNavbar";
import { useAppSelector } from "../app/hook";

/* Installed by: npx shadcn@latest add @react-bits/LightRays-JS-CSS */
import LightRays from "@/components/LightRays";

function Home() {
  const user = useAppSelector((state) => state.auth.user);
  const reduceMotion = useReducedMotion();

  const displayName = user?.name?.trim() || user?.email || "";

  return (
    /* Root: ONE stacking context covering the whole viewport.
       z-order: rays (0) < fade (1) < navbar (40, sticky, set inside UserNavbar)
       and hero content (10). min-height (not height) so it is exactly one
       viewport normally but grows instead of clipping on tiny screens. */
    <div
      style={{
        position: "relative",
        isolation: "isolate",
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        background: "#09090B",
      }}
    >
      {/* Background: LightRays spans the full root, INCLUDING behind the navbar.
          Its own wrapper clips the canvas, so it can never cause page scroll,
          and it never receives pointer events. */}
      <div
        aria-hidden="true"
        className="opacity-70 sm:opacity-100"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={reduceMotion ? 0 : 0.6}
          lightSpread={1}
          rayLength={1.5}
          followMouse={!reduceMotion}
          mouseInfluence={0.08}
          noiseAmount={0.03}
          distortion={0.02}
        />
      </div>

      {/* Soft fade into the page background so the rays stay subtle. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background:
            "linear-gradient(to bottom, transparent 35%, rgba(9,9,11,0.85) 100%)",
        }}
      />

      {/* Navbar: sticky with z-index 40 inside UserNavbar, above the rays. */}
      <UserNavbar />

      {/* Hero: takes all remaining height, above the rays. */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          flex: "1 1 0%",
          minHeight: 360,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Content */}
        <section
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: 672,
            padding: "0 24px",
            textAlign: "center",
          }}
        >
          <h1 className="text-balance font-serif text-3xl font-normal tracking-tight text-zinc-100 sm:text-4xl lg:text-5xl">
            Welcome back, {displayName}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-zinc-400 sm:text-base">
            Manage your account and profile from one place.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 12,
              marginTop: 32,
            }}
          >
            {/* Static UI for now: no navigation, handlers, or routes. */}
            <button
              type="button"
              className="rounded-lg bg-white text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] focus-visible:outline-none"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 40,
                padding: "0 20px",
              }}
            >
              Get Started
            </button>
            <button
              type="button"
              className="rounded-lg border border-zinc-800 bg-zinc-950/60 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] focus-visible:outline-none"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 40,
                padding: "0 20px",
              }}
            >
              Learn More
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home