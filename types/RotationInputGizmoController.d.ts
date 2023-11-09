import { Controller, Value, ViewProps } from '@tweakpane/core';
import { Rotation } from './Rotation.js';
import { RotationInputGizmoView } from './RotationInputGizmoView.js';
import type { RotationInputGizmoControllerConfig } from './RotationInputGizmoControllerConfig.js';
export declare class RotationInputGizmoController implements Controller<RotationInputGizmoView> {
    readonly value: Value<Rotation>;
    readonly view: RotationInputGizmoView;
    readonly viewProps: ViewProps;
    private readonly mode_;
    private readonly ptHandler_;
    private px_;
    private py_;
    private angleState_;
    constructor(doc: Document, config: RotationInputGizmoControllerConfig);
    private handlePointerEvent_;
    private onPointerDown_;
    private onPointerMove_;
    private onPointerUp_;
    private onPadKeyDown_;
    private changeModeIfNotAuto_;
    private autoRotate_;
}
