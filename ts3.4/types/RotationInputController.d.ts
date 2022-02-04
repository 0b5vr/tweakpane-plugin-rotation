import { Controller, Value, ViewProps } from '@tweakpane/core';
import { RotationInputView } from './RotationInputView';
import { Quaternion } from './Quaternion';
import { RotationInputControllerConfig } from './RotationInputControllerConfig';
export declare class RotationInputController implements Controller<RotationInputView> {
    readonly value: Value<Quaternion>;
    readonly view: RotationInputView;
    readonly viewProps: ViewProps;
    private readonly swatchC_;
    private readonly textC_;
    private readonly popC_;
    private readonly gizmoC_;
    private readonly foldable_;
    constructor(doc: Document, config: RotationInputControllerConfig);
    private onButtonBlur_;
    private onButtonClick_;
    private onPopupChildBlur_;
    private onPopupChildKeydown_;
}
