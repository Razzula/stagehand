import { CompositeType, PropType } from "./stage/stage";

export interface Template {
    meta: {
        fps: number;
        height?: number;
        width?: number;
    };
    background: {
        propType: PropType;
        compositeType: CompositeType;
        image: string;
        width: number;
        height: number;
    };
    heads: FixedAsset[];
    others: FixedAsset[];
    video: CustomAsset;
    extra: FixedAsset[];
}

export interface FixedAsset {
    id: string;
    propType: PropType;
    compositeType: CompositeType;

    sprites: string[];

    width: number;
    height: number;
    origin: {
        x: number;
        y: number;
    };
    paths?: Record<string, Path[]>;
}

export interface CustomAsset {
    id: string;
    propType: PropType;
    compositeType: CompositeType;

    width: number;
    height: number;
    origin: {
        x: number;
        y: number;
    };
    paths?: Record<string, Path[]>;
}

export interface Path {
    keyframe: number;
    value: number;
}

