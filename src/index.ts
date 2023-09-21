import { RotationInputPluginEuler } from './RotationInputPluginEuler.js';
import { RotationInputPluginQuaternion } from './RotationInputPluginQuaternion.js';
import type { TpPlugin } from 'tweakpane';

export {
  RotationInputPluginEuler,
  RotationInputPluginQuaternion,
};

export const id = 'rotation';

export const css = '__css__';

export const plugins: TpPlugin[] = [
  RotationInputPluginEuler,
  RotationInputPluginQuaternion,
];
