import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

import { scriptFromTemplate, sceneFromTemplate, CustomVideoAsset } from './stage/director';

import { testplate } from './data/testplate';
import './App.css';
import { Scene } from './stage/stage';

const videoSrc = '/assets/sample.mp4';
const generatedSrc2 = new URL('/bin/out2.mp4', import.meta.url).href;

const videoData: CustomVideoAsset = {
    id: 'sample',
    height: 1080,
    width: 1920,
    durationSec: 28,
}

function App() {

    const [frames, setFrames] = useState<string[]>([]);

    useEffect(() => {
        testFrameGeneration();
    }, []);

    async function testFrameGeneration() {
        const renderedFrames: string[] = [];
        const scene = sceneFromTemplate(testplate, [videoData]);
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
        const temp = await invoke('renderVideo', { payload });
        alert(temp);
    }

    return (
        <div>

            <div>
                <h2>Video</h2>
                <video className='pane'
                    src={new URL(videoSrc, import.meta.url).href} controls={true}
                />
                <h2>Template</h2>
                <img className='pane'
                    src={new URL(testplate.background.image, import.meta.url).href}
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
                        onClick={() => renderVideo(
                            sceneFromTemplate(testplate, [videoData])
                        )}
                        >
                        Render Video!
                    </button>
                </div>
                <video className='pane'
                    src={generatedSrc2} controls={true}
                />
            </div>

        </div>
    );
}

export default App;
