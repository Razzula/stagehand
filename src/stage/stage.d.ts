export type PropType = 'image' | 'clear';

export interface Scene {
    id?: string;
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
    src: string;
}

export interface StageDirection {
    id?: string;
    prop: Prop['id'];
    type: PropType;

    // common
    x: number;          // pixel top-left
    y: number;          // pixel top-left
    width: number;      // pixel
    height: number;     // pixel
}
