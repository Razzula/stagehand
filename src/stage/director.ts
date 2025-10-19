import { Template } from "../Template";
import { Prop, Scene, Script, StageDirection } from "./stage";

export function scriptFromTemplate(template: Template, frame: number, frameTimeSec: number, frameW?: number, frameH?: number): Script {

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
        const normX = (head.origin.x / canvasW); // XXX
        const normY = (head.origin.y / canvasH); // XXX
        const px = origin.x + Math.round(normX * canvasW);
        const py = origin.y + Math.round(normY * canvasH);
        const w = Math.round((head.width / canvasW) * canvasW); // XXX
        const h = Math.round((head.height / canvasH) * canvasH); // XXX

        // bob head according to...
        // random fluctuation
        // TODO: audio
        const bob = Math.round(((Math.sin(frameTimeSec * 8) + 1) / 2) * -20);

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
    width: number;
    height: number;
    durationSec?: number;
}

export function sceneFromTemplate(template: Template, customAssets: CustomVideoAsset[]): Scene {

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
        src: `/home/razzula/repos/stagehand/public/${template.background.image}`,
    };
    for (const head of template.heads) {
        props[head.id] = {
            id: head.id,
            src: `/home/razzula/repos/stagehand/public/${head.image}`,
        };
    }

    // handle audio

    // calculate frames
    const totalFrames = durationSec * fps;
    for (let i = 0; i < totalFrames; i++) {
        const frameTimeSec = i / fps;
        const script = scriptFromTemplate(template, i+1, frameTimeSec, frameW, frameH);
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
