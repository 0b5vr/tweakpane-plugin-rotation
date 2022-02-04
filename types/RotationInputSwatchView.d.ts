import { Value, View } from '@tweakpane/core';
import type { Quaternion } from './Quaternion';
import type { RotationInputSwatchViewConfig } from './RotationInputSwatchViewConfig';
export declare class RotationInputSwatchView implements View {
    readonly element: HTMLElement;
    readonly value: Value<Quaternion>;
    readonly buttonElement: HTMLButtonElement;
    private swatchElem_;
    constructor(doc: Document, config: RotationInputSwatchViewConfig);
    private update_;
    private onValueChange_;
}
