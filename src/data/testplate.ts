import { Template } from "../stage/Template";

export const testplate: Template = {
    id: 'testplate',
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
            class: 'pengwyn-eyes',
            sprites: [
                '/assets/pengwyneyes.png',
                '/assets/pengwyneyes_blink.png',
            ],
            origin: {
                x: 294,
                y: 443,
            },
            propType: 'image',
            compositeType: 'paste',
        },
        {
            id: 'pengwyn-eyes-cry',
            class: 'pengwyn-eyes',
            sprites: [
                '/assets/pengwyneyes_cry.png',
                '/assets/pengwyneyes_cry_blink.png',
            ],
            origin: {
                x: 294,
                y: 443,
            },
            propType: 'image',
            compositeType: 'paste',
        },
        {
            id: 'pengwyn-gagged',
            sprites: [
                '/assets/pengwyn_gag.png',
            ],
            origin: {
                x: 247,
                y: 494,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'pengwyn',
            sprites: [
                '/assets/pengwynbeak.png',
            ],
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
            id: 'pengwyn-hoodie',
            class: 'pengwyn-hoodie',
            sprites: [
                '/assets/hoodie.png',
            ],
            origin: {
                x: 236,
                y: 501,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'pengwyn-hoodie-cern',
            class: 'pengwyn-hoodie',
            sprites: [
                '/assets/hoodie_cern.png',
            ],
            origin: {
                x: 236,
                y: 501,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'pengwyn-hoodie-grogu',
            class: 'pengwyn-hoodie',
            sprites: [
                '/assets/hoodie_grogu.png',
            ],
            origin: {
                x: 236,
                y: 501,
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
            origin: {
                x: 651,
                y: 121,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'razz-tea',
            class: 'razz-held-right',
            sprites: [
                '/assets/razzmug.png',
            ],
            origin: {
                x: 369,
                y: 625,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'razz-bible',
            class: 'razz-held-right',
            sprites: [
                '/assets/razzBible.png',
            ],
            origin: {
                x: 359,
                y: 587,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'kiwi-treaty',
            class: 'kiwi-held-right',
            sprites: [
                '/assets/kiwiTreaty.png',
            ],
            origin: {
                x: 1176,
                y: 442,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'kiwi-newspaper',
            class: 'kiwi-held-right',
            sprites: [
                '/assets/kiwiNewspaper.png',
            ],
            origin: {
                x: 1225,
                y: 469,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'kiwi-scroll',
            class: 'kiwi-held-right',
            sprites: [
                '/assets/kiwiScroll.png',
            ],
            origin: {
                x: 1190,
                y: 457,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'kiwi-bible',
            class: 'kiwi-held-right',
            sprites: [
                '/assets/kiwiBible.png',
            ],
            origin: {
                x: 1236,
                y: 449,
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
            origin: {
                // relative to clock
                x: 27,
                y: 24,
            },
            propType: 'image',
            compositeType: 'paste',
        },
        {
            id: 'calander-day',
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
            width: 27,
            origin: {
                // relative to calander
                x: 38,
                y: 14,
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
            origin: {
                // relative to calander
                x: 24,
                y: 58,
            },
            propType: 'image',
            compositeType: 'paste',
        },
        {
            id: 'calander-year',
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
            width: 27,
            origin: {
                // relative to calander
                x: 12,
                y: 96,
            },
            propType: 'image',
            compositeType: 'paste',
        },
    ],
}
