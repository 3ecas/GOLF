import { SURFACES } from '../config.js';

export const SURFACE_GROUND = 'ground';
export const SURFACE_SAND = 'sand';

export function surfaceProps(type) {
  return SURFACES[type] || SURFACES[SURFACE_GROUND];
}
