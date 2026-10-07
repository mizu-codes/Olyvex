import type { FC } from "react";

export type LightRaysOrigin =
  | "top-left"
  | "top-center"
  | "top-right"
  | "left"
  | "right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface LightRaysProps {
  /** Where the rays emanate from. Default: "top-center" */
  raysOrigin?: LightRaysOrigin;
  /** Hex color, e.g. "#8B5CF6". Default: "#ffffff" */
  raysColor?: string;
  /** Default: 1 */
  raysSpeed?: number;
  /** Default: 1 */
  lightSpread?: number;
  /** Default: 2 */
  rayLength?: number;
  /** Default: false */
  pulsating?: boolean;
  /** Default: 1.0 */
  fadeDistance?: number;
  /** Default: 1.0 */
  saturation?: number;
  /** Default: true */
  followMouse?: boolean;
  /** Default: 0.1 */
  mouseInfluence?: number;
  /** Default: 0.0 */
  noiseAmount?: number;
  /** Default: 0.0 */
  distortion?: number;
  /** Default: false */
  lightMode?: boolean;
  /** Extra class for the container. Default: "" */
  className?: string;
}

declare const LightRays: FC<LightRaysProps>;
export default LightRays;