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
        propType: 'image',
        compositeType: 'paste',
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
            propType: 'image',
            compositeType: 'paste',
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
            propType: 'image',
            compositeType: 'overlay',
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
            propType: 'image',
            compositeType: 'overlay',
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
            propType: 'image',
            compositeType: 'overlay',
        },
    ],
    video: {
        id: 'sample',
        width: 515,
        height: 290,
        origin: {
            x: 676,
            y: 312,
        },
        paths: {},
        propType: 'video',
        compositeType: 'paste',
    },
    others: [
        {
            id: 'telly',
            sprites: [
                '/assets/telly.png',
                '/assets/telly_blink.png',
            ],
            width: 566,
            height: 546,
            origin: {
                x: 651,
                y: 121,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'kiwi-held',
            sprites: [
                '/assets/treaty.png',
            ],
            width: 212,
            height: 258,
            origin: {
                x: 1161,
                y: 442,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
    ],
}
