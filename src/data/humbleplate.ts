import { Template } from "../stage/Template";

export const humbleplate: Template = {
    id: 'humbleplate',
    meta: {
        fps: 30,
        width: 1920,
        height: 1080,
    },
    background: {
        id: 'background',
        sprites: [
            '/assets/plates/humble.png',
        ],
        origin: { x: 0, y: 0, },
        propType: 'image',
        compositeType: 'paste',
        width: 1920,
        height: 1080,
    },
    heads: [
        // DM
        {
            id: 'dm-eyes',
            class: 'dm-eyes',
            sprites: [
                '/assets/sprites/dnd/DM-eyes.png',
                '/assets/sprites/dnd/DM-eyes_blink.png',
            ],
            origin: {
                x: 854,
                y: 335,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        {
            id: 'dm',
            sprites: [
                '/assets/sprites/dnd/DM-Soph-mouth.png',
            ],
            origin: {
                x: 871,
                y: 309,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        // BOOSE
        {
            id: 'boose',
            sprites: [
                '/assets/sprites/dnd/Boose-mouth.png',
            ],
            origin: {
                x: 511,
                y: 387,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        // {
        //     id: 'dm-eyes',
        //     class: 'dm-eyes',
        //     sprites: [
        //         '/assets/sprites/dnd/DM-eyes.png',
        //         '/assets/sprites/dnd/DM-eyes_blink.png',
        //     ],
        //     origin: {
        //         x: 854,
        //         y: 335,
        //     },
        //     propType: 'image',
        //     compositeType: 'overlay',
        // },
        // MR. FREND
        {
            id: 'mrFrend',
            sprites: [
                '/assets/sprites/dnd/MrFrend-mouth.png',
            ],
            origin: {
                x: 1328,
                y: 384,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        // {
        //     id: 'dm-eyes',
        //     class: 'dm-eyes',
        //     sprites: [
        //         '/assets/sprites/dnd/DM-eyes.png',
        //         '/assets/sprites/dnd/DM-eyes_blink.png',
        //     ],
        //     origin: {
        //         x: 854,
        //         y: 335,
        //     },
        //     propType: 'image',
        //     compositeType: 'overlay',
        // },
        // BAMBISMUM
        {
            id: 'bambismum',
            sprites: [
                '/assets/sprites/dnd/Bambismum-mouth.png',
            ],
            origin: {
                x: 185,
                y: 581,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        // {
        //     id: 'dm-eyes',
        //     class: 'dm-eyes',
        //     sprites: [
        //         '/assets/sprites/dnd/DM-eyes.png',
        //         '/assets/sprites/dnd/DM-eyes_blink.png',
        //     ],
        //     origin: {
        //         x: 854,
        //         y: 335,
        //     },
        //     propType: 'image',
        //     compositeType: 'overlay',
        // },
        // RED
        {
            id: 'red',
            sprites: [
                '/assets/sprites/dnd/Red-mouth.png',
            ],
            origin: {
                x: 1629,
                y: 604,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        // {
        //     id: 'dm-eyes',
        //     class: 'dm-eyes',
        //     sprites: [
        //         '/assets/sprites/dnd/DM-eyes.png',
        //         '/assets/sprites/dnd/DM-eyes_blink.png',
        //     ],
        //     origin: {
        //         x: 854,
        //         y: 335,
        //     },
        //     propType: 'image',
        //     compositeType: 'overlay',
        // },
        // EL JERBINO
        {
            id: 'elJerbino',
            sprites: [
                '/assets/sprites/dnd/ElJerbino-mouth.png',
            ],
            origin: {
                x: 399,
                y: 790,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        // {
        //     id: 'dm-eyes',
        //     class: 'dm-eyes',
        //     sprites: [
        //         '/assets/sprites/dnd/DM-eyes.png',
        //         '/assets/sprites/dnd/DM-eyes_blink.png',
        //     ],
        //     origin: {
        //         x: 854,
        //         y: 335,
        //     },
        //     propType: 'image',
        //     compositeType: 'overlay',
        // },
        // BADGER
        {
            id: 'badger',
            sprites: [
                '/assets/sprites/dnd/Badger-mouth.png',
            ],
            origin: {
                x: 1329,
                y: 749,
            },
            propType: 'image',
            compositeType: 'overlay',
        },
        // {
        //     id: 'dm-eyes',
        //     class: 'dm-eyes',
        //     sprites: [
        //         '/assets/sprites/dnd/DM-eyes.png',
        //         '/assets/sprites/dnd/DM-eyes_blink.png',
        //     ],
        //     origin: {
        //         x: 854,
        //         y: 335,
        //     },
        //     propType: 'image',
        //     compositeType: 'overlay',
        // },
    ],
    // video: {
    //     id: 'sample',
    //     width: 487,
    //     height: 274,
    //     origin: {
    //         x: 693,
    //         y: 317,
    //     },
    //     paths: {},
    //     propType: 'video',
    //     compositeType: 'paste',
    // },
    others: [],
    extra: [],
}
