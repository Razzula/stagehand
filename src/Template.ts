export interface Template {
    background: string;
    heads: Head[];
}

export interface Head {
    image: string;
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
