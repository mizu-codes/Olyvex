import type { ComponentPropsWithoutRef, JSX } from "react";

/**
 * Types for the installed React Bits Galaxy (Galaxy.jsx).
 * Every prop below is destructured in Galaxy.jsx (defaults in comments).
 * Any other prop is spread onto the root <div> via `...rest`, so the
 * props extend the standard div props.
 *
 * NOTE: `focal` and `rotation` are in the component's effect dependency list.
 * Pass module-level constants (not inline array literals) or the WebGL scene
 * is torn down and rebuilt on every parent re-render.
 */
export interface GalaxyProps extends ComponentPropsWithoutRef<"div"> {
  /** default [0.5, 0.5] */
  focal?: readonly [number, number];
  /** default [1.0, 0.0] */
  rotation?: readonly [number, number];
  /** default 0.5 */
  starSpeed?: number;
  /** default 1 */
  density?: number;
  /** default 140 */
  hueShift?: number;
  /** default false */
  disableAnimation?: boolean;
  /** default 1.0 */
  speed?: number;
  /** default true */
  mouseInteraction?: boolean;
  /** default 0.3 */
  glowIntensity?: number;
  /** default 0.0 */
  saturation?: number;
  /** default true */
  mouseRepulsion?: boolean;
  /** default 2 */
  repulsionStrength?: number;
  /** default 0.3 */
  twinkleIntensity?: number;
  /** default 0.1 */
  rotationSpeed?: number;
  /** default 0 */
  autoCenterRepulsion?: number;
  /** default true */
  transparent?: boolean;
  /** default false */
  lightMode?: boolean;
}

declare function Galaxy(props: GalaxyProps): JSX.Element;

export default Galaxy;