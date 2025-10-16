import { Template } from "../Template";

const testplateBackground = new URL('/assets/testplate.png', import.meta.url).href;
const kiwiHead = new URL('/assets/kiwihead.png', import.meta.url).href;

export const testplate: Template = {
    background: testplateBackground,
    heads: [
        {
            image: kiwiHead,
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
