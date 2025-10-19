export interface Template {
    background: {
        image: string;
        width: number;
        height: number;
    };
    heads: Head[];
}

export interface Head {
    image: string;
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
