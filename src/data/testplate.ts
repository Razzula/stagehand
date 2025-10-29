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
        width: 487,
        height: 274,
        origin: {
            x: 693,
            y: 317,
        },
        paths: {},
        propType: 'video',
        compositeType: 'paste',
    },
    others: [
        {
            id: 'clock',
            sprites: [
                '/assets/clock/clock_blank.png',
                '/assets/clock/clock_blink.png',
            ],
            width: 225,
            height: 125,
            origin: {
                x: 718,
                y: 23,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'calander',
            sprites: [
                '/assets/calander/calander.png',
            ],
            width: 148,
            height: 160,
            origin: {
                x: 996,
                y: 0,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
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
                x: 1176,
                y: 442,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
    ],
    extra: [
        {
            id: 'clock-digit',
            sprites: [
                '/assets/clock/clock_digit0.png',
                '/assets/clock/clock_digit1.png',
                '/assets/clock/clock_digit2.png',
                '/assets/clock/clock_digit3.png',
                '/assets/clock/clock_digit4.png',
                '/assets/clock/clock_digit5.png',
                '/assets/clock/clock_digit6.png',
                '/assets/clock/clock_digit7.png',
                '/assets/clock/clock_digit8.png',
                '/assets/clock/clock_digit9.png',
            ],
            width: 33,
            height: 74,
            origin: {
                // relative to clock
                x: 27,
                y: 24,
            },
            propType: 'image',
            compositeType: 'paste',
        },
        {
            id: 'calander-digit',
            sprites: [
                '/assets/calander/calander_digit0.png',
                '/assets/calander/calander_digit1.png',
                '/assets/calander/calander_digit2.png',
                '/assets/calander/calander_digit3.png',
                '/assets/calander/calander_digit4.png',
                '/assets/calander/calander_digit5.png',
                '/assets/calander/calander_digit6.png',
                '/assets/calander/calander_digit7.png',
                '/assets/calander/calander_digit8.png',
                '/assets/calander/calander_digit9.png',
            ],
            width: 45,
            height: 65,
            origin: {
                // relative to calander
                x: 27,
                y: 61,
            },
            propType: 'image',
            compositeType: 'paste',
        },
        {
            id: 'calander-month',
            sprites: [
                '/assets/calander/calander_month1.png',
                '/assets/calander/calander_month2.png',
                '/assets/calander/calander_month3.png',
                '/assets/calander/calander_month4.png',
                '/assets/calander/calander_month5.png',
                '/assets/calander/calander_month6.png',
                '/assets/calander/calander_month7.png',
                '/assets/calander/calander_month8.png',
                '/assets/calander/calander_month9.png',
                '/assets/calander/calander_month10.png',
                '/assets/calander/calander_month11.png',
                '/assets/calander/calander_month12.png',
            ],
            width: 87,
            height: 36,
            origin: {
                // relative to calander
                x: 27,
                y: 18,
            },
            propType: 'image',
            compositeType: 'paste',
        },
    ],
}
