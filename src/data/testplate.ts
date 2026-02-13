import { Template } from "../stage/Template";
import { background } from "./background";

export const testplate: Template = {
    id: 'testplate',
    meta: {
        fps: 30,
        width: 1920,
        height: 1080,
    },
    background: {
        id: 'background',
        propType: 'precomposed',
        compositeType: 'paste',
        template: background,
        width: 1920,
        height: 1080,
        origin: { x: 0, y: 0, },
    },
    heads: [
        {
            id: 'pengwyn-eyes',
            class: 'pengwyn-eyes',
            sprites: [
                '/assets/sprites/pengwyn/pengwyneyes.png',
                '/assets/sprites/pengwyn/pengwyneyes_blink.png',
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
                '/assets/sprites/pengwyn/pengwyneyes_cry.png',
                '/assets/sprites/pengwyn/pengwyneyes_cry_blink.png',
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
                '/assets/sprites/pengwyn/pengwyn_gag.png',
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
                '/assets/sprites/pengwyn/pengwynbeak.png',
            ],
            origin: {
                x: 307,
                y: 470,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'pengwyn-hoodie',
            class: 'pengwyn-hoodie',
            sprites: [
                '/assets/sprites/pengwyn/hoodie.png',
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
                '/assets/sprites/pengwyn/hoodie_cern.png',
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
                '/assets/sprites/pengwyn/hoodie_grogu.png',
            ],
            origin: {
                x: 236,
                y: 501,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'pengwyn-hoodie-clippy',
            class: 'pengwyn-hoodie',
            sprites: [
                '/assets/sprites/pengwyn/hoodie_clippy.png',
            ],
            origin: {
                x: 236,
                y: 501,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'pengwyn-hoodie-darland',
            class: 'pengwyn-hoodie',
            sprites: [
                '/assets/sprites/pengwyn/hoodie_darland.png',
            ],
            origin: {
                x: 236,
                y: 501,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'pengwyn-hoodie-cambria',
            class: 'pengwyn-hoodie',
            sprites: [
                '/assets/sprites/pengwyn/hoodie_cambria.png',
            ],
            origin: {
                x: 236,
                y: 501,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'pengwyn-santa',
            class: 'pengwyn-hat',
            sprites: [
                '/assets/sprites/pengwyn/santa.png',
            ],
            origin: {
                x: 227,
                y: 364,
            },
            propType: 'image',
            compositeType: 'overlay',
            disabled: true,
        },
        {
            id: 'kiwi-eyes',
            sprites: [
                '/assets/sprites/kiwi/kiwieyes.png',
                '/assets/sprites/kiwi/kiwieyes_blink.png',
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
                '/assets/sprites/kiwi/kiwibeak.png',
            ],
            origin: {
                x: 1379,
                y: 263,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'kiwi-gown',
            class: 'kiwi-gown',
            sprites: [
                '/assets/sprites/kiwi/kiwiGown.png',
            ],
            origin: {
                x: 1045,
                y: 342,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'kiwi-joeys',
            class: 'kiwi-gown',
            sprites: [
                '/assets/sprites/kiwi/kiwiGown_joeys.png',
            ],
            origin: {
                x: 1045,
                y: 342,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'kiwi-suit',
            class: 'kiwi-gown',
            sprites: [
                '/assets/sprites/kiwi/kiwiGown_suit.png',
            ],
            origin: {
                x: 1045,
                y: 342,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'kiwi-suit-jngil',
            class: 'kiwi-gown',
            sprites: [
                '/assets/sprites/kiwi/kiwiGown_suit_jack.png',
            ],
            origin: {
                x: 1045,
                y: 342,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'kiwi-santa',
            class: 'kiwi-hat',
            sprites: [
                '/assets/sprites/kiwi/santa.png',
            ],
            origin: {
                x: 1521,
                y: 161,
            },
            propType: 'image',
            compositeType: 'overlay',
            disabled: true,
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
                '/assets/sprites/clock/clock_blank.png',
                '/assets/sprites/clock/clock_blink.png',
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
                '/assets/sprites/calander/calander.png',
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
                '/assets/sprites/telly.png',
                '/assets/sprites/telly_blink.png',
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
                '/assets/sprites/pengwyn/razzmug.png',
            ],
            origin: {
                x: 369,
                y: 625,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'razz-keyboard',
            class: 'razz-held-right',
            sprites: [
                '/assets/sprites/pengwyn/razzKeyboard.png',
            ],
            origin: {
                x: 300,
                y: 668,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'razz-mouse',
            class: 'razz-held-left',
            sprites: [
                '/assets/sprites/pengwyn/razzMouse.png',
            ],
            origin: {
                x: 470,
                y: 649,
            },
            propType: 'image',
            compositeType: 'overlay',
            disabled: true,
        },
        {
            id: 'razz-bible',
            class: 'razz-held-right',
            sprites: [
                '/assets/sprites/pengwyn/razzBible.png',
            ],
            origin: {
                x: 359,
                y: 587,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'razz-x1',
            class: 'razz-held-right',
            sprites: [
                '/assets/sprites/pengwyn/razzX1.png',
            ],
            origin: {
                x: 368,
                y: 604,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'kiwi-treaty',
            class: 'kiwi-held-right',
            sprites: [
                '/assets/sprites/kiwi/kiwiTreaty.png',
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
                '/assets/sprites/kiwi/kiwiNewspaper.png',
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
                '/assets/sprites/kiwi/kiwiScroll.png',
            ],
            origin: {
                x: 1192,
                y: 457,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'kiwi-bible',
            class: 'kiwi-held-right',
            sprites: [
                '/assets/sprites/kiwi/kiwiBible.png',
            ],
            origin: {
                x: 1236,
                y: 449,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'kiwi-x1',
            class: 'kiwi-held-right',
            sprites: [
                '/assets/sprites/kiwi/kiwiX1.png',
            ],
            origin: {
                x: 1229,
                y: 476,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'kiwi-wii',
            class: 'kiwi-held-right',
            sprites: [
                '/assets/sprites/kiwi/kiwiWii.png',
            ],
            origin: {
                x: 1256,
                y: 436,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'kiwi-cheese',
            class: 'kiwi-held-right',
            sprites: [
                '/assets/sprites/kiwi/kiwiCheese.png',
            ],
            origin: {
                x: 1252,
                y: 435,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'kiwi-mug-right',
            class: 'kiwi-held-right',
            sprites: [
                '/assets/sprites/kiwi/kiwiMugR.png',
            ],
            origin: {
                x: 1258,
                y: 466,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'kiwi-mug-left',
            class: 'kiwi-held-left',
            sprites: [
                '/assets/sprites/kiwi/kiwiMug.png',
            ],
            origin: {
                x: 1475,
                y: 656,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'kiwi-wiichuck',
            class: 'kiwi-held-left',
            sprites: [
                '/assets/sprites/kiwi/kiwiWiichuck.png',
            ],
            origin: {
                x: 1493,
                y: 659,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
    ],
    extra: [
        {
            id: 'clock-digit',
            sprites: [
                '/assets/sprites/clock/clock_digit0.png',
                '/assets/sprites/clock/clock_digit1.png',
                '/assets/sprites/clock/clock_digit2.png',
                '/assets/sprites/clock/clock_digit3.png',
                '/assets/sprites/clock/clock_digit4.png',
                '/assets/sprites/clock/clock_digit5.png',
                '/assets/sprites/clock/clock_digit6.png',
                '/assets/sprites/clock/clock_digit7.png',
                '/assets/sprites/clock/clock_digit8.png',
                '/assets/sprites/clock/clock_digit9.png',
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
                '/assets/sprites/calander/calander_digit0.png',
                '/assets/sprites/calander/calander_digit1.png',
                '/assets/sprites/calander/calander_digit2.png',
                '/assets/sprites/calander/calander_digit3.png',
                '/assets/sprites/calander/calander_digit4.png',
                '/assets/sprites/calander/calander_digit5.png',
                '/assets/sprites/calander/calander_digit6.png',
                '/assets/sprites/calander/calander_digit7.png',
                '/assets/sprites/calander/calander_digit8.png',
                '/assets/sprites/calander/calander_digit9.png',
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
                '/assets/sprites/calander/calander_month1.png',
                '/assets/sprites/calander/calander_month2.png',
                '/assets/sprites/calander/calander_month3.png',
                '/assets/sprites/calander/calander_month4.png',
                '/assets/sprites/calander/calander_month5.png',
                '/assets/sprites/calander/calander_month6.png',
                '/assets/sprites/calander/calander_month7.png',
                '/assets/sprites/calander/calander_month8.png',
                '/assets/sprites/calander/calander_month9.png',
                '/assets/sprites/calander/calander_month10.png',
                '/assets/sprites/calander/calander_month11.png',
                '/assets/sprites/calander/calander_month12.png',
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
                '/assets/sprites/calander/calander_digit0.png',
                '/assets/sprites/calander/calander_digit1.png',
                '/assets/sprites/calander/calander_digit2.png',
                '/assets/sprites/calander/calander_digit3.png',
                '/assets/sprites/calander/calander_digit4.png',
                '/assets/sprites/calander/calander_digit5.png',
                '/assets/sprites/calander/calander_digit6.png',
                '/assets/sprites/calander/calander_digit7.png',
                '/assets/sprites/calander/calander_digit8.png',
                '/assets/sprites/calander/calander_digit9.png',
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
