import { Template } from '../Template';
import { Prop, Scene, Script, StageDirection } from './stage';
import { invoke } from '@tauri-apps/api/core';

const STAGEHAND_DIR = '/media/razzula/media2/Programming/Web/';

export function scriptFromTemplate(
    template: Template,
    frame: number, frameTimeSec: number,
    audioVolume?: Record<string, number>,
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
        const bob = Math.round((audioVolume?.[id] ?? 0) * -40);

        props.push({
            prop: head.id,
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

export async function sceneFromTemplate(template: Template, customAssets: CustomVideoAsset[], audioSplit: Record<string, number[][]>): Promise<Scene> {

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
        src: `${STAGEHAND_DIR}/stagehand/public/${template.background.image}`,
    };
    for (const head of template.heads) {
        props[head.id] = {
            id: head.id,
            src: `${STAGEHAND_DIR}/stagehand/public/${head.image}`,
        };
    }

    // handle audio
    const floatSamples = await invoke('extractAudio', {
        videoPath: `${STAGEHAND_DIR}/stagehand/public/${customAssets[0].src}`,
        audioSampleRate: customAssets[0].audioSampleRate,
    }) as Float32Array;
    console.log('length of floatSamples:', floatSamples.length);
    const volumesPerFrame = computeRMSPerFrame(floatSamples, customAssets[0].audioSampleRate, fps);
    console.log('length of volumes:', volumesPerFrame.length);

    // associate volumes to heads
    const filteredVolumesPerFrame = [];
    for (let i = 0; i < volumesPerFrame.length; i++) {
        filteredVolumesPerFrame.push({
            'kiwi': isWithinBounds(audioSplit['kiwi'], i) ? volumesPerFrame[i] : 0,
            'pengwyn': isWithinBounds(audioSplit['pengwyn'], i) ? volumesPerFrame[i] : 0,
        });
    }

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
            frameW, frameH,
        );
        frames.push(script);
    }

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

function computeRMSPerFrame(samples: Float32Array, sampleRate: number, fps: number) {
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

function isWithinBounds(audioSplit: number[][], frame: number): boolean {
    for (const range of audioSplit) {
        const startFrame = range[0];
        const endFrame = range[1];
        if (frame >= startFrame && frame < endFrame) {
            return true;
        }
    }
    return false;
}