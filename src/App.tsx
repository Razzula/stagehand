import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

import { scriptFromTemplate, sceneFromTemplate, CustomVideoAsset } from './stage/director';

import { testplate } from './data/testplate';
import { Scene } from './stage/stage';

import './App.css';

const generatedSrc2 = new URL('/bin/out2.mp4', import.meta.url).href;

const videoData: CustomVideoAsset = {
    id: 'sample',
    src: '/assets/sample.mp4',
    height: 1080,
    width: 1920,
    durationSec: 28,
    audioSampleRate: 48000,
};

function App() {

    const [template, setTemplate] = useState(testplate);
    const [audioSplit, setAudioSplit] = useState<Record<string, number[][]>>({
        'kiwi': [[0, 20*30], [23*30, 27*30]],
        'pengwyn': [[20.5*30, 24*30], [27*30, 30*30]],
    });

    const [frames, setFrames] = useState<string[]>([]);
    const [rendered, setRendered] = useState<boolean>(false);

    useEffect(() => {
        testFrameGeneration();
    }, []);

    async function testFrameGeneration() {
        const renderedFrames: string[] = [];
        const scene = await sceneFromTemplate(template, [videoData], audioSplit);
        for (let i = 0; i < 1; i++) {
            const frame = scene.frames[i*30]; // every second
            const frameAsScene: Scene = {
                ...scene,
                frames: [frame],
            };
            const render = await invoke('renderFrame', { payload: frameAsScene });
            renderedFrames.push(render as string);
            setFrames(renderedFrames);
        }
    }

    async function renderVideo(payload: Scene) {
        setRendered(false);
        await invoke('renderVideo', { payload });
        setRendered(true);
    }

    return (
        <div>

            <div>
                <h2>Video</h2>
                <video className='pane'
                    src={new URL(videoData.src, import.meta.url).href} controls={true}
                />
                <h2>Template</h2>
                <img className='pane'
                    src={new URL(template.background.image, import.meta.url).href}
                />
            </div>

            <div>
                <h2>Preview</h2>
                <img className='pane'
                    src={frames[0]}
                />
            </div>

            <div>
                <h2>Render</h2>
                <div>
                    <button
                        onClick={() => sceneFromTemplate(template, [videoData], audioSplit).then(scene => renderVideo(scene)) }
                    >
                        Render Video!
                    </button>
                </div>
                { rendered &&
                    <video className='pane'
                        src={generatedSrc2} controls={true}
                    />
                }
            </div>

        </div>
    );
}

export default App;
