import { lofi } from './lofi.js';

export function mod( x: number, d: number ): number {
  return x - lofi( x, d );
}
