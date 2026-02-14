import seedrandom from 'seedrandom';

import { calculateMoonPhase } from '../data/background';

import { Template } from './Template';
import { Prop, Scene, Script, StageDirection } from './stage';

const STAGEHAND_DIR = '/media/razzula/media2/Programming/Web/';

export function scriptFromTemplate(
    template: Template,
    customAssets: CustomVideoAsset[],
    frame: number, _frameTimeSec: number,
    audioSplit?: Record<string, number[][] | undefined>,
    audioVolume?: Record<string, number>,
    prngs?: Record<string, Blinker>,
    frameW?: number, frameH?: number,
    datetime?: Date,
): Script {

    const id = `frame_${frame}`;

    const canvasW = template.background.width ?? 1920;
    const canvasH = template.background.height ?? 1080;

    if (frameW === undefined) {
        frameW = canvasW;
    }
    if (frameH === undefined) {
        frameH = canvasH;
    }

    const origin = { x: 0, y: 0 }; // XXX
    if (canvasW < frameW) {
        origin.x = Math.floor((frameW - canvasW) / 2);
    }
    if (canvasH < frameH) {
        origin.y = Math.floor((frameH - canvasH) / 2);
    }

    const props: StageDirection[] = [];

    if (template.background) {
        if (!template.background.disabled) {
            const prop: StageDirection = {
                prop: template.background.id,
                x: origin.x,
                y: origin.y,
                width: template.background.width,
                height: template.background.height,
                sprite: 0,
            };
            if (template.background.propType === 'colour') {
                if (template.background.paths?.colour) {
                    const secondsOfDay = datetime
                        ? datetime.getHours() * 3600 + datetime.getMinutes() * 60 + datetime.getSeconds()
                        : 0;
                    const i = ['skybox'].includes(template.background.id) ? (secondsOfDay / 86400) : frame;
                    prop.colour = template.background.paths.colour(i, datetime) as [number, number, number];
                }
            }
            if (template.background.propType === 'precomposed') {
                const rain = findPropInTemplate(template.background.template, 'rain');
                if (rain && !rain.disabled) {
                    // RAIN
                    const blinker = prngs?.[rain.id];
                    prop.sprite = blinker?.getSprite(frame) ?? 0;
                }
                const snow = findPropInTemplate(template.background.template, 'snow');
                if (snow && !snow.disabled) {
                    // STARS
                    const blinker = prngs?.[snow.id];
                    prop.sprite = blinker?.getSprite(frame) ?? 0;
                }

            }
            props.push(prop);
        }
    }

    for (const head of template.heads) {
        if (head.disabled) {
            continue;
        }
        const id = head.id;

        const normX = (head.origin.x / canvasW); // XXX
        const normY = (head.origin.y / canvasH); // XXX
        const px = origin.x + Math.round(normX * canvasW);
        const py = origin.y + Math.round(normY * canvasH);

        let ox = 0;
        let oy = 0;

        // bob head according to audio volume
        oy += Math.round((audioVolume?.[id] ?? 0) * -40);

        if (head.paths?.offset) {
            const secondsOfDay = datetime
                ? datetime.getHours() * 3600 + datetime.getMinutes() * 60 + datetime.getSeconds()
                : 0;
            const i = ['sun', 'moon'].includes(head.id) ? (secondsOfDay / 86400) : frame;

            const offset = head.paths.offset(i, datetime) as Record<string, number>;
            ox += offset.x;
            oy += offset.y;
        }

        // blinking
        const blinker = prngs?.[id];
        const sprite = (head.id === 'moon')
            ? calculateMoonPhase(datetime ?? new Date)
            : blinker?.getSprite(frame) ?? 0;

        props.push({
            prop: id,
            sprite,
            x: Math.round(px + ox),
            y: Math.round(py + oy),
            width: head.width,
            height: head.height,
        });
    }

    for (const customAsset of customAssets) {

        if (template.video) {
            const id = customAsset.id;

            const normX = (template.video.origin.x / canvasW); // XXX
            const normY = (template.video.origin.y / canvasH); // XXX
            const px = origin.x + Math.round(normX * canvasW);
            const py = origin.y + Math.round(normY * canvasH);

            const frameTimeSec = frame / template.meta.fps;
            let assetFrame = Math.floor(frameTimeSec * customAsset.fps);
            const totalFrames = customAsset.totalFrames;
            if (customAsset.loop) {
                assetFrame = assetFrame % totalFrames;
            }
            else {
                assetFrame = Math.min(assetFrame, totalFrames - 1);
            }

            props.push({
                prop: id,
                sprite: assetFrame,
                x: px,
                y: py,
                width: template.video.width,
                height: template.video.height,
            });
        }
    }

    for (const other of template.others) {
        if (other.disabled) {
            continue;
        }
        const id = other.id;

        const normX = (other.origin.x / canvasW); // XXX
        const normY = (other.origin.y / canvasH); // XXX
        const px = origin.x + Math.round(normX * canvasW);
        const py = origin.y + Math.round(normY * canvasH);

        const blinker = prngs?.[id];

        props.push({
            prop: id,
            sprite: blinker?.getSprite(frame) ?? 0,
            x: px,
            y: py,
            width: other.width,
            height: other.height,
        });

        const currentDatetime = datetime ?? customAssets[0]?.datetime;
        if (currentDatetime) {
            // CLOCK
            if (id === 'clock') {
                const digitTemplate = template.extra.find(e => e.id === 'clock-digit');
                if (digitTemplate) {
                    const hours = currentDatetime.getUTCHours().toString().padStart(2, '0');
                    const mins = currentDatetime.getUTCMinutes().toString().padStart(2, '0');
                    const digits = [...hours, ...mins,]

                    const normX = (digitTemplate.origin.x / canvasW); // XXX
                    const normY = (digitTemplate.origin.y / canvasH); // XXX
                    const dpx = px + Math.round(normX * canvasW);
                    const dpy = py + Math.round(normY * canvasH);

                    const w = digitTemplate.width ?? 0;

                    digits.forEach((digit, i) => {
                        props.push({
                            prop: digitTemplate.id,
                            sprite: Number(digit),
                            x: Math.round(dpx + (i >= 2 ? w : 0) + (w * i)), // XXX
                            y: dpy,
                            width: digitTemplate.width,
                            height: digitTemplate.height,
                        });
                    });
                }
            }
            // CALANDER
            else if (id === 'calander') {
                const dayTemplate = template.extra.find(e => e.id === 'calander-day');
                if (dayTemplate) {
                    const digits = currentDatetime.getUTCDate().toString().padStart(2, '0').split('');

                    const normX = (dayTemplate.origin.x / canvasW); // XXX
                    const normY = (dayTemplate.origin.y / canvasH); // XXX
                    const dpx = px + Math.round(normX * canvasW);
                    const dpy = py + Math.round(normY * canvasH);

                    const w = dayTemplate.width ?? 0;

                    digits.forEach((digit, i) => {
                        props.push({
                            prop: dayTemplate.id,
                            sprite: Number(digit),
                            x: Math.round(dpx + (w * i)),
                            y: dpy,
                            width: dayTemplate.width,
                            height: dayTemplate.height,
                        });
                    });
                }
                const monthTemplate = template.extra.find(e => e.id === 'calander-month');
                if (monthTemplate) {
                    const digit = currentDatetime.getUTCMonth();

                    const normX = (monthTemplate.origin.x / canvasW); // XXX
                    const normY = (monthTemplate.origin.y / canvasH); // XXX
                    const dpx = px + Math.round(normX * canvasW);
                    const dpy = py + Math.round(normY * canvasH);

                    props.push({
                        prop: monthTemplate.id,
                        sprite: digit,
                        x: dpx,
                        y: dpy,
                        width: monthTemplate.width,
                        height: monthTemplate.height,
                    });
                }
                const yearTemplate = template.extra.find(e => e.id === 'calander-year');
                if (yearTemplate) {
                    const digits = currentDatetime.getUTCFullYear().toString().split('');

                    const normX = (yearTemplate.origin.x / canvasW); // XXX
                    const normY = (yearTemplate.origin.y / canvasH); // XXX
                    const dpx = px + Math.round(normX * canvasW);
                    const dpy = py + Math.round(normY * canvasH);

                    const w = yearTemplate.width ?? 0;

                    digits.forEach((digit, i) => {
                        props.push({
                            prop: yearTemplate.id,
                            sprite: Number(digit),
                            x: Math.round(dpx + (w * i)),
                            y: dpy,
                            width: yearTemplate.width,
                            height: yearTemplate.height,
                        });
                    });
                }
            }
        }
    }

    return {
        id,
        props,
    };
}

export interface CustomVideoAsset {
    id: string;
    propType: 'customVideo';
    src: string
    width: number;
    height: number;
    durationSec?: number;
    audioSampleRate: number;
    datetime: Date;
    fps: number;
    totalFrames: number,
    loop?: boolean;
}

export async function sceneFromTemplate(
    template: Template,
    customAssets: CustomVideoAsset[],
    audioTrack: string,
    audioData: Float32Array | null,
    audioSplit: Record<string, number[][] | undefined>,
    datetime?: Date,
): Promise<Scene> {
    const props: Record<string, Prop> = {};
    const precompute: Scene[] = [];
    const frames: Script[] = [];

    const fps = template.meta.fps;
    const frameW = template.meta.width;
    const frameH = template.meta.height;

    // determine duration
    const durationSec = Math.max(...customAssets.map(a => a.durationSec ?? 0));

    let currentDatetime = datetime ?? customAssets?.[0]?.datetime ?? undefined;

    let spriteCount = 1;

    // setup props
    for (const prop of [
        template.background,
        ...template.heads,
        ...customAssets,
        ...template.others,
    ]) {
        if (prop.propType === 'image') {
            props[prop.id] = {
                id: prop.id,
                sprites: prop.sprites.map(spritePath => `${STAGEHAND_DIR}/stagehand/public/${spritePath}`),
                propType: prop.propType,
                compositeType: prop.compositeType,
            };
            if (prop.sprites?.length > spriteCount) {
                spriteCount = prop.sprites.length;
            }
        }
        else if (prop.propType === 'customVideo') {
            if (template.video) {
                props[prop.id] = {
                    id: prop.id,
                    sprites: [`${STAGEHAND_DIR}/stagehand/public/${prop.src}`],
                    propType: template.video.propType,
                    compositeType: template.video.compositeType,

                    width: template.video.width,
                    height: template.video.height,
                };
            }
        }
        else if (prop.propType === 'precomposed') {
            const template = await sceneFromTemplate(
                prop.template,
                [], 'null', null, {},
                currentDatetime,
            );
            precompute.push(template);
        }
        else if (prop.propType === 'colour') {
            if (prop.paths?.colour) {
                const secondsOfDay = datetime
                    ? datetime.getHours() * 3600 + datetime.getMinutes() * 60 + datetime.getSeconds()
                    : 0;
                const i = ['skybox'].includes(prop.id) ? (secondsOfDay / 86400) : 0;
                const colour = prop.paths.colour(i, datetime) as [number, number, number];

                props[prop.id] = {
                    id: prop.id,
                    propType: prop.propType,
                    compositeType: prop.compositeType,
                    sprites: [],
                    colour: [Math.round(colour[0]), Math.round(colour[1]), Math.round(colour[2])],
                }
            }
        }

        if (prop.id === 'clock') {
            // load clock digits if clock is in use
            const digitTemplate = template.extra.find(e => e.id === 'clock-digit');
            if (digitTemplate?.propType === 'image') {
                props[digitTemplate.id] = {
                    id: digitTemplate.id,
                    sprites: digitTemplate.sprites.map(spritePath => `${STAGEHAND_DIR}/stagehand/public/${spritePath}`),
                    propType: digitTemplate.propType,
                    compositeType: digitTemplate.compositeType,
                }
            }
        }
        else if (prop.id === 'calander') {
            // load calander digits if clock is in use
            const dayTemplate = template.extra.find(e => e.id === 'calander-day');
            if (dayTemplate?.propType === 'image') {
                props[dayTemplate.id] = {
                    id: dayTemplate.id,
                    sprites: dayTemplate.sprites.map(spritePath => `${STAGEHAND_DIR}/stagehand/public/${spritePath}`),
                    propType: dayTemplate.propType,
                    compositeType: dayTemplate.compositeType,
                }
            }
            const monthTemplate = template.extra.find(e => e.id === 'calander-month');
            if (monthTemplate?.propType === 'image') {
                props[monthTemplate.id] = {
                    id: monthTemplate.id,
                    sprites: monthTemplate.sprites.map(spritePath => `${STAGEHAND_DIR}/stagehand/public/${spritePath}`),
                    propType: monthTemplate.propType,
                    compositeType: monthTemplate.compositeType,
                }
            }
            const yearTemplate = template.extra.find(e => e.id === 'calander-year');
            if (yearTemplate?.propType === 'image') {
                props[yearTemplate.id] = {
                    id: yearTemplate.id,
                    sprites: yearTemplate.sprites.map(spritePath => `${STAGEHAND_DIR}/stagehand/public/${spritePath}`),
                    propType: yearTemplate.propType,
                    compositeType: yearTemplate.compositeType,
                }
            }
        }
    }

    if (audioSplit) {
        const pengwynGag = findPropInTemplate(template, 'pengwyn-gagged');
        if (pengwynGag) {
            if (audioSplit?.['pengwyn'] && audioSplit?.['pengwyn']?.length > 0) {
                // gag not needed
                pengwynGag.disabled = true;
            }
        }
    }

    // handle audio
    const filteredVolumesPerFrame = [];
    if (customAssets.length > 0) {
        const volumesPerFrame = computeRMSPerFrame(audioData, customAssets[0].audioSampleRate, fps);

        // associate volumes to heads
        for (let i = 0; i < volumesPerFrame.length; i++) {
            filteredVolumesPerFrame.push({
                'kiwi': isWithinBounds(audioSplit['kiwi'], i, fps) ? volumesPerFrame[i] : 0,
                'pengwyn': isWithinBounds(audioSplit['pengwyn'], i, fps) ? (volumesPerFrame[i] * 1.2) : 0,
            });
        }
    }

    // generate blinking patterns
    const prngs: Record<string, Blinker> = {};
    const id = (customAssets?.length > 0) ? customAssets?.[0].src : 'null';
    prngs['rain'] = new Blinker(
        'rain',
        0.2 * fps, 0.3 * fps,
        0.2 * fps, 0.3 * fps,
        seedrandom(`${id}-rain`),
        3,
    );
    prngs['snow'] = new Blinker(
        'snow',
        0.8 * fps, 1.6 * fps,
        0.8 * fps, 1.6 * fps,
        seedrandom(`${id}-snow`),
        3,
    );
    template.heads.forEach(head => {
        if (head.propType === 'image' && head.sprites.length > 1) {
            if (!['rain', 'snow'].includes(head.id)) {
                // HEAD BLINKER
                prngs[head.id] = new Blinker(
                    head.id,
                    1.2 * fps, 7 * fps,
                    0.16 * fps, 0.32 * fps,
                    seedrandom(`${id}-${head.id}`)
                );
            }
        }
    });
    template.others.forEach(other => {
        if (other.propType === 'image' && other.sprites.length > 1) {
            if (other.id === 'clock') {
                prngs[other.id] = new Blinker(
                    other.id,
                    fps, fps,
                    fps, fps,
                    seedrandom(`${customAssets?.[0].src ?? 'null'}-${other.id}`)
                );
            }
            else {
                // TV?
                prngs[other.id] = new Blinker(
                    other.id,
                    0.3 * fps, 3 * fps,
                    0.3 * fps, 1.2 * fps,
                    seedrandom(`${customAssets?.[0].src ?? 'null'}-${other.id}`)
                );
            }
        }
    });

    // calculate frames
    const childMaxFrames = precompute.reduce((m, s) => Math.max(m, s.frames.length), 0);
    const totalFrames = (durationSec !== -Infinity && fps !== 0)
        ? (durationSec * fps)
        : Math.max(spriteCount, childMaxFrames);
    for (let i = 0; i < totalFrames; i++) {
        const frameTimeSec = i / fps;
        if (currentDatetime && frameTimeSec % 1 === 0) {
            // a second has passed
            currentDatetime = new Date(currentDatetime.getTime() + 1000);
        }
        const script = scriptFromTemplate(
            template, customAssets,
            i + 1, frameTimeSec,
            audioSplit, filteredVolumesPerFrame[i] ?? undefined,
            prngs,
            frameW, frameH,
            currentDatetime,
        );
        frames.push(script);
    }

    console.log('scene completed');
    return {
        id: customAssets.length > 0 ? customAssets[0].id : template.id,
        fps,
        canvasSize: {
            width: frameW ?? template.background.width,
            height: frameH ?? template.background.height,
        },
        props,
        audio: audioTrack ?? 'null',
        precompute,
        frames,
    };
}

function computeRMSPerFrame(samples: Float32Array | null, sampleRate: number, fps: number) {
    if (samples === null) {
        return new Float32Array();
    }

    const samplesPerFrame = Math.round(sampleRate / fps);
    const totalFrames = Math.ceil(samples.length / samplesPerFrame);
    const volumes = new Float32Array(totalFrames);

    for (let f = 0; f < totalFrames; f++) {
        const start = f * samplesPerFrame;
        const end = Math.min(start + samplesPerFrame, samples.length);
        let sumSq = 0;
        for (let i = start; i < end; i++) {
            const v = samples[i];
            sumSq += v * v;
        }
        volumes[f] = Math.sqrt(sumSq / (end - start || 1));
    }
    return volumes;
}

function isWithinBounds(audioSplit: number[][] | undefined, frame: number, fps: number): boolean {
    if (audioSplit === undefined) {
        return false;
    }
    for (const range of audioSplit) {
        const startFrame = range[0] * fps;
        const endFrame = range[1] * fps;
        if (frame >= startFrame && frame < endFrame) {
            return true;
        }
    }
    return false;
}

class Blinker {

    private state: 'blink' | 'unblink' = 'unblink';
    private nextChangeFrame: number | null = null;
    private currentSprite: number = 0;

    constructor(
        private id: string,
        private minInterval: number,
        private maxInterval: number,
        private minBlink: number,
        private maxBlink: number,
        private rng: () => number,
        private numSprites: number = 2,
    ) {
        this.scheduleNextBlink(0);
    }

    getSprite(frame: number): number {
        if (this.nextChangeFrame === null || frame >= this.nextChangeFrame) {
            // update state
            if (this.state === 'blink') {
                this.state = 'unblink';
            }
            else if (this.state === 'unblink') {
                this.state = 'blink';
            }
            this.currentSprite = (this.currentSprite + 1) % this.numSprites;
            this.scheduleNextBlink(frame);
        }
        // console.log(this.id, frame, this.currentSprite);
        return this.currentSprite;
    }

    scheduleNextBlink(currentFrame: number) {
        if (this.state === 'unblink') {
            this.nextChangeFrame = currentFrame + this.randomBetween(this.minInterval, this.maxInterval);
        }
        else if (this.state === 'blink') {
            this.nextChangeFrame = currentFrame + this.randomBetween(this.minBlink, this.maxBlink);
        }
    }

    randomBetween(min: number, max: number) {
        return min + this.rng() * (max - min);
    }
}

function findPropInTemplate(t: Template, id: string): any | undefined {
    return (
        t.heads.find(p => p.id === id) ??
        t.others.find(p => p.id === id) ??
        t.extra.find(p => p.id === id) ??
        (t.background?.propType === 'precomposed'
            ? findPropInTemplate(t.background.template, id)
            : undefined)
    );
}
