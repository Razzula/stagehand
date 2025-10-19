import { Template } from "../Template";

export const testplate: Template = {
    background: {
        image: '/assets/testplate.png',
        width: 1250,
        height: 958,
    },
    heads: [
        {
            id: 'kiwi',
            image: '/assets/kiwihead.png',
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
        }
    ],
}
