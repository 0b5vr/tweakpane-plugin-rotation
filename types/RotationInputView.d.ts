import { View } from '@tweakpane/core';
import type { RotationInputViewConfig } from './RotationInputViewConfig.js';
export declare class RotationInputView implements View {
    readonly element: HTMLElement;
    readonly swatchElement: HTMLElement;
    readonly textElement: HTMLElement;
    readonly pickerElement: HTMLElement | null;
    constructor(doc: Document, config: RotationInputViewConfig);
}
