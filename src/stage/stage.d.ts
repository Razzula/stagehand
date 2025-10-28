export type PropType = 'image' | 'video';
export type CompositeType = 'overlay' | 'paste';

export interface Scene {
    id?: string;
    fps: number;
    canvasSize: {
        // pixels
        width: number;
        height: number;
    };
    props: Record<string, Prop>;

    frames: Script[],

    outputPath?: string;
}

export interface Script {
    id: string;
    props: StageDirection[]; // draw in array order (0 bottom, last top)
}

export interface Prop {
    id: string;
    sprites: string[];
    propType: PropType;
    compositeType: CompositeType;

    width?: number;
    height?: number;
}

export interface StageDirection {
    id?: string;
    prop: Prop['id'];
    sprite?: number;

    // common
    x: number;          // pixel top-left
    y: number;          // pixel top-left
    width: number;      // pixel
    height: number;     // pixel
}
