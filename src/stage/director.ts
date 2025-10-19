import { Template } from "../Template";
import { Prop, Scene } from "./stage";

export function sceneFrameFromTemplate(template: Template, frame: number, frameTimeSec: number, frameW?: number, frameH?: number): Scene {

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

    const props: Prop[] = [];

    props.push({
        type: 'image',
        src: `/media/razzula/media2/Programming/Web/stagehand/public/${template.background.image}`,
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
        const bob = Math.round(((Math.sin(frameTimeSec) + 1) / 2) * -20);

        props.push({
            type: 'image',
            src: `/media/razzula/media2/Programming/Web/stagehand/public/${head.image}`,
            x: px,
            y: py + bob,
            width: w,
            height: h,
        });
    }

    return { 
        id,
        canvasSize: { width: canvasW, height: canvasH },
        props,
    };
}

export function sceneFromTemplate(template: Template, durationSec: number, fps: number, frameW?: number, frameH?: number): Scene[] {
    const frames: Scene[] = [];
    const totalFrames = durationSec * fps;

    for (let i = 0; i < totalFrames; i++) {
        const frameTimeSec = i / fps;
        const scene = sceneFrameFromTemplate(template, i+1, frameTimeSec, frameW, frameH);
        frames.push(scene);
    }

    return frames;
}
