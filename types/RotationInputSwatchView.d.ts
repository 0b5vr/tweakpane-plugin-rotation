import { Value, View } from '@tweakpane/core';
import { Rotation } from './Rotation.js';
import type { RotationInputSwatchViewConfig } from './RotationInputSwatchViewConfig.js';
export declare class RotationInputSwatchView implements View {
    readonly element: HTMLElement;
    readonly value: Value<Rotation>;
    readonly buttonElement: HTMLButtonElement;
    private readonly svgElem_;
    private readonly projector_;
    private readonly xArc_;
    private readonly yArc_;
    private readonly zArc_;
    private readonly rArc_;
    constructor(doc: Document, config: RotationInputSwatchViewConfig);
    private update_;
    private onValueChange_;
}
