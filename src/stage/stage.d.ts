export type PropType = 'image' | 'clear';

export interface Scene {
    id: string;
    canvasSize: {
        // pixels
        width: number;
        height: number;
    };
    props: Prop[];      // draw in array order (0 bottom, last top)
    outputPath?: string;
}

export interface Prop {
    id?: string;
    type: PropType;

    // common
    x: number;          // pixel top-left
    y: number;          // pixel top-left
    width: number;      // pixel
    height: number;     // pixel

    // image-specific
    src?: string;       // absolute path or file://
}
