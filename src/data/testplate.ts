import { Template } from "../Template";

export const testplate: Template = {
    meta: {
        fps: 30,
        width: 1920,
        height: 1080,
    },
    background: {
        image: '/assets/testplate.png',
        width: 1920,
        height: 1080,
    },
    heads: [
        {
            id: 'pengwyn-eyes',
            sprites: [
                '/assets/pengwyneyes.png',
                '/assets/pengwyneyes_blink.png',
            ],
            width: 110,
            height: 42,
            origin: {
                x: 294,
                y: 443,
            },
        },
        {
            id: 'pengwyn',
            sprites: [
                '/assets/pengwynbeak.png',
            ],
            width: 111,
            height: 59,
            origin: {
                x: 307,
                y: 470,
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
            id: 'kiwi-eyes',
            sprites: [
                '/assets/kiwieyes.png',
                '/assets/kiwieyes_blink.png',
            ],
            width: 100,
            height: 40,
            origin: {
                x: 1518,
                y: 232,
            },
        },
        {
            id: 'kiwi',
            sprites: [
                '/assets/kiwibeak.png',
            ],
            width: 216,
            height: 88,
            origin: {
                x: 1379,
                y: 263,
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
