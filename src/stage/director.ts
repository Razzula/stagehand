import seedrandom from 'seedrandom';

import { Template } from './Template';
import { Prop, Scene, Script, StageDirection } from './stage';

const STAGEHAND_DIR = '/media/razzula/media2/Programming/Web/';

export function scriptFromTemplate(
    template: Template,
    customAssets: CustomVideoAsset[],
    frame: number, _frameTimeSec: number,
    audioSplit?: Record<string, number[][]>,
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

    props.push({
        prop: 'background',
        x: origin.x,
        y: origin.y,
        width: template.background.width,
        height: template.background.height,
    });

    for (const head of template.heads) {
        const id = head.id;

        if (id === 'pengwyn-gagged') {
            if (audioSplit?.['pengwyn'] && audioSplit?.['pengwyn']?.length > 0) {
                // gag not needed
                continue;
            }
        }

        const normX = (head.origin.x / canvasW); // XXX
        const normY = (head.origin.y / canvasH); // XXX
        const px = origin.x + Math.round(normX * canvasW);
        const py = origin.y + Math.round(normY * canvasH);

        // bob head according to audio volume
        const bob = Math.round((audioVolume?.[id] ?? 0) * -40);

        // blinking
        const blinker = prngs?.[id];

        props.push({
            prop: id,
            sprite: blinker?.isBlink(frame) ? 1 : 0,//XXX
            x: px,
            y: py + bob,
            width: head.width,
            height: head.height,
        });
    }

    for (const customAsset of customAssets) {
        const id = customAsset.id;

        const normX = (template.video.origin.x / canvasW); // XXX
        const normY = (template.video.origin.y / canvasH); // XXX
        const px = origin.x + Math.round(normX * canvasW);
        const py = origin.y + Math.round(normY * canvasH);

        props.push({
            prop: id,
            sprite: frame,
            x: px,
            y: py,
            width: template.video.width,
            height: template.video.height,
        });
    }
    
    for (const other of template.others) {
        const id = other.id;
        
        const normX = (other.origin.x / canvasW); // XXX
        const normY = (other.origin.y / canvasH); // XXX
        const px = origin.x + Math.round(normX * canvasW);
        const py = origin.y + Math.round(normY * canvasH);
        
        const blinker = prngs?.[id];

        props.push({
            prop: id,
            sprite: blinker?.isBlink(frame) ? 1 : 0,
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
                            x: Math.round(dpx + (i >=2 ? w : 0) + (w * i)), // XXX
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
    src: string
    width: number;
    height: number;
    durationSec?: number;
    audioSampleRate: number;
    datetime: Date;
}

export async function sceneFromTemplate(
    template: Template,
    customAssets: CustomVideoAsset[],
    audioData: Float32Array | null,
    audioSplit: Record<string, number[][]>,
): Promise<Scene> {

    const props: Record<string, Prop> = {};
    const frames: Script[] = [];

    const fps = template.meta.fps;
    const frameW = template.meta.width;
    const frameH = template.meta.height;

    // determine duration
    const durationSec = Math.max(...customAssets.map(a => a.durationSec ?? 0));

    // setup props
    props['background'] = {
        id: 'background',
        sprites: [`${STAGEHAND_DIR}/stagehand/public/${template.background.image}`],
        propType: template.background.propType,
        compositeType: template.background.compositeType,
    };
    for (const head of template.heads) {
        props[head.id] = {
            id: head.id,
            sprites: head.sprites.map(spritePath => `${STAGEHAND_DIR}/stagehand/public/${spritePath}`),
            propType: head.propType,
            compositeType: head.compositeType,
        };
    }
    for (const customAsset of customAssets) {
        props[customAsset.id] = {
            id: customAsset.id,
            sprites: [`${STAGEHAND_DIR}/stagehand/public/${customAsset.src}`],
            propType: template.video.propType,
            compositeType: template.video.compositeType,

            width: template.video.width,
            height: template.video.height,
        };
    }
    for (const other of template.others) {
        props[other.id] = {
            id: other.id,
            sprites: other.sprites.map(spritePath => `${STAGEHAND_DIR}/stagehand/public/${spritePath}`),
            propType: other.propType,
            compositeType: other.compositeType,
        };

        if (other.id === 'clock') {
            // load clock digits if clock is in use
            const digitTemplate = template.extra.find(e => e.id === 'clock-digit');
            if (digitTemplate) {
                props[digitTemplate.id] = {
                    id: digitTemplate.id,
                    sprites: digitTemplate.sprites.map(spritePath => `${STAGEHAND_DIR}/stagehand/public/${spritePath}`),
                    propType: digitTemplate.propType,
                    compositeType: digitTemplate.compositeType,
                }
            }
        }
        else if (other.id === 'calander') {
            // load calander digits if clock is in use
            const dayTemplate = template.extra.find(e => e.id === 'calander-day');
            if (dayTemplate) {
                props[dayTemplate.id] = {
                    id: dayTemplate.id,
                    sprites: dayTemplate.sprites.map(spritePath => `${STAGEHAND_DIR}/stagehand/public/${spritePath}`),
                    propType: dayTemplate.propType,
                    compositeType: dayTemplate.compositeType,
                }
            }
            const monthTemplate = template.extra.find(e => e.id === 'calander-month');
            if (monthTemplate) {
                props[monthTemplate.id] = {
                    id: monthTemplate.id,
                    sprites: monthTemplate.sprites.map(spritePath => `${STAGEHAND_DIR}/stagehand/public/${spritePath}`),
                    propType: monthTemplate.propType,
                    compositeType: monthTemplate.compositeType,
                }
            }
            const yearTemplate = template.extra.find(e => e.id === 'calander-year');
            if (yearTemplate) {
                props[yearTemplate.id] = {
                    id: yearTemplate.id,
                    sprites: yearTemplate.sprites.map(spritePath => `${STAGEHAND_DIR}/stagehand/public/${spritePath}`),
                    propType: yearTemplate.propType,
                    compositeType: yearTemplate.compositeType,
                }
            }
        }
    }

    // handle audio
    console.log('length of floatSamples:', audioData?.length ?? 0);
    const volumesPerFrame = computeRMSPerFrame(audioData, customAssets[0].audioSampleRate, fps);
    console.log('length of volumes:', volumesPerFrame.length);

    // associate volumes to heads
    const filteredVolumesPerFrame = [];
    for (let i = 0; i < volumesPerFrame.length; i++) {
        filteredVolumesPerFrame.push({
            'kiwi': isWithinBounds(audioSplit['kiwi'], i, fps) ? volumesPerFrame[i] : 0,
            'pengwyn': isWithinBounds(audioSplit['pengwyn'], i, fps) ? (volumesPerFrame[i] * 1.2) : 0,
        });
    }

    // generate blinking patterns
    const prngs: Record<string, Blinker> = {};
    template.heads.forEach(head => {
        if (head.sprites.length > 1) {
            prngs[head.id] = new Blinker(
                1.2*fps, 7*fps,
                0.16*fps, 0.32*fps,
                seedrandom(`${customAssets?.[0].src ?? 'null'}-${head.id}`)
            );
        }
    });
    template.others.forEach(other => {
        if (other.sprites.length > 1) {
            if (other.id === 'clock') {
                prngs[other.id] = new Blinker(
                    fps, fps,
                    fps, fps,
                    seedrandom(`${customAssets?.[0].src ?? 'null'}-${other.id}`)
                );
            }
            else {
                prngs[other.id] = new Blinker(
                    0.3 * fps, 3 * fps,
                    0.3 * fps, 1.2 * fps,
                    seedrandom(`${customAssets?.[0].src ?? 'null'}-${other.id}`)
                );
            }
        }
    });

    let datetime = customAssets?.[0]?.datetime ?? undefined;

    // calculate frames
    const totalFrames = durationSec * fps;
    console.log('totalFrames:', totalFrames);
    console.log('audioFrames:', volumesPerFrame.length);
    for (let i = 0; i < totalFrames; i++) {
        const frameTimeSec = i / fps;
        if (datetime && frameTimeSec % 1 === 0) {
            // a second has passed
            datetime = new Date(datetime.getTime() + 1000);
        }
        const script = scriptFromTemplate(
            template, customAssets,
            i + 1, frameTimeSec,
            audioSplit, filteredVolumesPerFrame[i] ?? undefined,
            prngs,
            frameW, frameH,
            datetime,
        );
        frames.push(script);
    }

    console.log('scene completed');
    return {
        id: customAssets?.[0].id ?? template.id,
        fps,
        canvasSize: {
            width: frameW ?? template.background.width,
            height: frameH ?? template.background.height,
        },
        props,
        audio: customAssets?.[0].src,
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

function isWithinBounds(audioSplit: number[][], frame: number, fps: number): boolean {
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

    constructor(
        private minInterval: number,
        private maxInterval: number,
        private minBlink: number,
        private maxBlink: number,
        private rng: () => number
    ) {
        this.scheduleNextBlink(0);
    }

    isBlink(frame: number) {
        if (this.nextChangeFrame === null || frame >= this.nextChangeFrame) {
            // update state
            if (this.state === 'blink') {
                this.state = 'unblink';
            }
            else if (this.state === 'unblink') {
                this.state = 'blink';
            }
            this.scheduleNextBlink(frame);
        }
        return this.state === 'blink';
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
