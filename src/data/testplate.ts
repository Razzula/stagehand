import { Template } from "../Template";

export const testplate: Template = {
    meta: {
        fps: 30,
        width: 1920,
        height: 1080,
    },
    background: {
        image: '/assets/testplate.png',
        width: 1250,
        height: 958,
    },
    heads: [
        {
            id: 'kiwi',
            sprites: [
                '/assets/kiwihead.png',
                '/assets/kiwihead_blink.png',
            ],
            width: 205,
            height: 130,
            origin: {
                x: 909,
                y: 251 ,
            },
            paths: {
                'offset-y': [
                    {
                        keyframe: 0,
                        value: 0,
                    },
                    {
                        keyframe: 1,
                        value: 100,
                    }
                ],
            },
        },
        {
            id: 'pengwyn',
            sprites: [
                '/assets/penpengwyn.png',
                '/assets/penpengwyn_blink.png',
            ],
            width: 144,
            height: 113,
            origin: {
                x: 125,
                y: 391 ,
            },
            paths: {
                'offset-y': [
                    {
                        keyframe: 0,
                        value: 0,
                    },
                    {
                        keyframe: 1,
                        value: 100,
                    }
                ],
            },
        },
    ],
    video: {
        id: 'sample',
        width: 192,
        height: 108,
        origin: {
            x: 0,
            y: 0,
        },
        paths: {},
    },
}
