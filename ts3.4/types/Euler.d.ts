import { Quaternion } from './Quaternion';
import { Rotation } from './Rotation';
import { EulerOrder } from './EulerOrder';
import { EulerUnit } from './EulerUnit';
export declare class Euler extends Rotation {
    static fromQuaternion(quat: Quaternion, order: EulerOrder, unit: EulerUnit): Euler;
    x: number;
    y: number;
    z: number;
    order: EulerOrder;
    unit: EulerUnit;
    constructor(x?: number, y?: number, z?: number, order?: EulerOrder, unit?: EulerUnit);
    readonly quat: Quaternion;
    getComponents(): [
        number,
        number,
        number
    ];
    toEuler(order: EulerOrder, unit: EulerUnit): Euler;
    format(r: Rotation): Euler;
    reorder(order: EulerOrder): Euler;
    reunit(unit: EulerUnit): Euler;
}
