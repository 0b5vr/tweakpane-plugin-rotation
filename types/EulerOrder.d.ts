/**
 * Note that this is **extrinsic** rotations (which is same as Blender, Maya, and Unity).
 * Three.js uses intrinsic rotations so you have to reverse the order if you want to match the behavior with Three.js.
 */
export declare type EulerOrder = 'XYZ' | 'XZY' | 'YXZ' | 'YZX' | 'ZXY' | 'ZYX';
