import { CompositeType, PropType } from "./stage";

export interface Template {
    id: string;
    meta: {
        fps: number;
        height: number;
        width: number;
    };
    background: Asset;
    heads: Asset[];
    others: Asset[];
    video?: Asset;
    extra: Asset[];
}

export interface AssetBase {
    id: string;
    propType: PropType;
    compositeType: CompositeType;

    class?: string;
    disabled?: boolean;

    width?: number;
    height?: number;
    origin: {
        x: number;
        y: number;
    };
    paths?: Record<string, (i: number, d?: Date) => unknown>;
}

export interface FixedAsset extends AssetBase {
    propType: 'image';
    sprites: string[];
}


export interface VideoAsset extends AssetBase {
    propType: 'video';
}

export interface DynamicAsset extends AssetBase {
    propType: 'colour';
}

export interface PrecomposedAsset extends AssetBase {
    propType: 'precomposed';
    template: Template;
}

export type Asset = (
    | FixedAsset
    | VideoAsset
    | PrecomposedAsset
    | DynamicAsset
);

export interface Path {
    keyframe: number;
    value: number;
}

