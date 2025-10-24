export interface Template {
    meta: {
        fps: number;
        height?: number;
        width?: number;
    };
    background: {
        image: string;
        width: number;
        height: number;
    };
    heads: FixedAsset[];
    video: CustomAsset;
}

export interface FixedAsset {
    id: string;
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

