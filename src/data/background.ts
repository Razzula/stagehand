import SunCalc from 'suncalc';

import { Template } from "../stage/Template";

type RGB = [number, number, number];

function calculateSunPath(datetime: Date, latitude = 53.483959, longitude = -2.244644) {
    const dayStart = new Date(datetime);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(24);
    const totalMs = dayEnd.getTime() - dayStart.getTime();

    const times = SunCalc.getTimes(datetime, latitude, longitude);
    const tFromTime = (time: Date) => {
        const ms = time.getTime() - dayStart.getTime();
        return ms / totalMs; // normalized [0,1]
    };

    return [
        { t: 0, x: 0, y: 420 }, // pre-rise
        { t: tFromTime(times.sunrise), x: 0, y: 380 }, // rise
        { t: tFromTime(times.solarNoon), x: 12, y: 12 }, // peak
        { t: 0.6, x: 165, y: 25 },
        { t: tFromTime(times.sunset), x: 248, y: 120 }, // set
        { t: 1, x: 248, y: 420 },
    ];
}

function calculateMoonPath(datetime: Date, latitude = 53.483959, longitude = -2.244644) {
    const dayStart = new Date(datetime);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(24);
    const totalMs = dayEnd.getTime() - dayStart.getTime();

    const times = SunCalc.getMoonTimes(datetime, latitude, longitude);
    const tFromTime = (time: Date) => {
        const ms = time.getTime() - dayStart.getTime();
        return ms / totalMs; // normalized [0,1]
    };

    const rise = times.rise ?? new Date(new Date(datetime).setHours(0, 0, 0, 0));
    const set = times.set ?? new Date(new Date(datetime).setHours(23, 59, 59, 999));

    return [
        { t: tFromTime(new Date((rise.getTime() + set.getTime()) / 2)), x: 12, y: 12 }, // peak
        { t: 0.17, x: 165, y: 25 },
        { t: tFromTime(set), x: 248, y: 120 }, // set
        { t: 0.5, x: 248, y: 420 },
        { t: 0.8, x: 0, y: 420 }, // pre-rise
        { t: tFromTime(rise), x: 0, y: 380 }, // rise
    ];
}

function calculateSkyColour(datetime: Date, latitude = 53.483959, longitude = -2.244644): { t: number, colour: RGB }[] {
    const dayStart = new Date(datetime);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(24);
    const totalMs = dayEnd.getTime() - dayStart.getTime();

    const times = SunCalc.getTimes(datetime, latitude, longitude);
    const tFromTime = (time: Date) => {
        const ms = time.getTime() - dayStart.getTime();
        return ms / totalMs; // normalized [0,1]
    };
    console.log(times);
    return [
        // night start
        { t: 0, colour: [0, 0, 30] },
        { t: tFromTime(times.dawn), colour: [50, 50, 80] },
        { t: tFromTime(times.sunrise), colour: [255, 120, 80] },
        { t: tFromTime(times.sunriseEnd), colour: [255, 200, 160] },
        { t: tFromTime(times.goldenHourEnd), colour: [255, 160, 120] },
        // peak
        { t: tFromTime(times.solarNoon), colour: [135, 206, 235] },
        { t: tFromTime(times.goldenHour), colour: [255, 160, 120] },
        { t: tFromTime(times.sunsetStart), colour: [255, 200, 160] },
        { t: tFromTime(times.sunset), colour: [255, 120, 80] },
        { t: tFromTime(times.dusk), colour: [50, 50, 80] },
        // night end
        { t: 1, colour: [0, 0, 30] },
    ];
}

function interpolatePath(path: { t: number, x: number, y: number }[], t: number) {
    // clamp t to [0,1]
    t = Math.max(0, Math.min(1, t));

    // find which segment t is in
    for (let i = 0; i < path.length - 1; i++) {
        const a = path[i];
        const b = path[i + 1];
        if (t >= a.t && t <= b.t) {
            const segmentT = (t - a.t) / (b.t - a.t);
            const easedT = segmentT ** 2 * (3 - 2 * segmentT); // smoothstep
            return {
                x: a.x + (b.x - a.x) * easedT,
                y: a.y + (b.y - a.y) * easedT
            };
        }
    }
    // if t == 1
    return { x: path[path.length - 1].x, y: path[path.length - 1].y };
}

function interpolateColour(colours: { t: number, colour: RGB }[], t: number): RGB {
    // clamp t
    t = Math.max(0, Math.min(1, t));

    // find segment
    for (let i = 0; i < colours.length - 1; i++) {
        const a = colours[i];
        const b = colours[i + 1];
        if (t >= a.t && t <= b.t) {
            const segmentT = (t - a.t) / (b.t - a.t);
            return [
                a.colour[0] + (b.colour[0] - a.colour[0]) * segmentT,
                a.colour[1] + (b.colour[1] - a.colour[1]) * segmentT,
                a.colour[2] + (b.colour[2] - a.colour[2]) * segmentT,
            ];
        }
    }
    return colours[colours.length - 1].colour;
}

export const background: Template = {
    id: 'background',
    meta: {
        fps: 0,
        height: 1080,
        width: 1920,
    },
    background: {
        id: 'skybox',
        width: 1920, // actually 476
        height: 1080, // actually 474
        origin: { x: 0, y: 0, },
        propType: 'colour',
        compositeType: 'paste',
        paths: {
            'colour': (t: number, d?: Date) => interpolateColour(calculateSkyColour(d ?? new Date), t),
        },
    },
    heads: [
        {
            id: 'sun',
            sprites: [
                '/assets/sprites/sky/sun.png',
            ],
            width: 100,
            height: 100,
            origin: { x: 0, y: 0, },
            propType: 'image',
            compositeType: 'overlay',
            paths: {
                'offset': (t: number, d?: Date) => interpolatePath(calculateSunPath(d ?? new Date), t),
            }
        },
        {
            id: 'moon',
            sprites: [
                '/assets/sprites/sky/moon.png',
            ],
            width: 100,
            height: 100,
            origin: { x: 0, y: 0, },
            propType: 'image',
            compositeType: 'overlay',
            paths: {
                'offset': (t: number, d?: Date) => interpolatePath(calculateMoonPath(d ?? new Date), t),
            }
        },
    ],
    others: [
        {
            id: 'scene-plate',
            sprites: [
                '/assets/plates/testplate.png',
            ],
            width: 1920,
            height: 1080,
            origin: { x: 0, y: 0, },
            propType: 'image',
            compositeType: 'overlay',
        },
    ],
    extra: [],
}
