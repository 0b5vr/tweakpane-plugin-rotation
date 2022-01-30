import { mod } from './mod';

export function sanitizeAngle( angle: number ): number {
  return mod( angle + Math.PI, Math.PI * 2.0 ) - Math.PI;
}
