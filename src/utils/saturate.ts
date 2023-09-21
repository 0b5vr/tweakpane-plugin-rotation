import { clamp } from './clamp.js';

export function saturate( x: number ): number {
  return clamp( x, 0.0, 1.0 );
}
