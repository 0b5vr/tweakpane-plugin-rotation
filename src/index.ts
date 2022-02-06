import { RotationInputPluginEuler } from './RotationInputPluginEuler';
import { RotationInputPluginQuaternion } from './RotationInputPluginQuaternion';
import type { TpPlugin } from 'tweakpane';

export {
  RotationInputPluginEuler,
  RotationInputPluginQuaternion,
};

export const plugins: TpPlugin[] = [
  RotationInputPluginEuler,
  RotationInputPluginQuaternion,
];
