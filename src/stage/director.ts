import seedrandom from 'seedrandom';

import { Template } from '../Template';
import { Prop, Scene, Script, StageDirection } from './stage';

const STAGEHAND_DIR = '/media/razzula/media2/Programming/Web/';

export function scriptFromTemplate(
    template: Template,
    frame: number, _frameTimeSec: number,
    audioVolume?: Record<string, number>,
    prngs?: Record<string, Blinker>,
    frameW?: number, frameH?: number
): Script {

    const id = `frame_${frame}`;

    const canvasW = template.background.width;
    const canvasH = template.background.height;

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
        type: 'paste',
        x: origin.x,
        y: origin.y,
        width: template.background.width,
        height: template.background.height,
    });

    for (const head of template.heads) {
        const id = head.id;

        const normX = (head.origin.x / canvasW); // XXX
        const normY = (head.origin.y / canvasH); // XXX
        const px = origin.x + Math.round(normX * canvasW);
        const py = origin.y + Math.round(normY * canvasH);
        const w = Math.round((head.width / canvasW) * canvasW); // XXX
        const h = Math.round((head.height / canvasH) * canvasH); // XXX

        // bob head according to audio volume
        const bob = Math.round((audioVolume?.[id] ?? 0) * -60);

        // blinking
        const blinker = prngs?.[id];

        props.push({
            prop: head.id,
            sprite: blinker?.isBlink(frame) ? 1 : 0,//XXX
            type: 'image',
            x: px,
            y: py + bob,
            width: w,
            height: h,
        });
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
    };
    for (const head of template.heads) {
        props[head.id] = {
            id: head.id,
            sprites: head.sprites.map(spritePath => `${STAGEHAND_DIR}/stagehand/public/${spritePath}`),
        };
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
                1.2*30, 7*30,
                0.16*30, 0.32*30,
                seedrandom(`${customAssets?.[0].src ?? 'null'}-${head.id}`)
            );
        }
    });

    // calculate frames
    const totalFrames = durationSec * fps;
    console.log('totalFrames:', totalFrames);
    console.log('audioFrames:', volumesPerFrame.length);
    for (let i = 0; i < totalFrames; i++) {
        const frameTimeSec = i / fps;
        const script = scriptFromTemplate(
            template,
            i + 1, frameTimeSec,
            filteredVolumesPerFrame[i] ?? undefined,
            prngs,
            frameW, frameH,
        );
        frames.push(script);
    }

    console.log('scene completed');
    return {
        fps,
        canvasSize: {
            width: frameW ?? template.background.width,
            height: frameH ?? template.background.height,
        },
        props,
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
