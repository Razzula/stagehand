import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

import { sceneFrameFromTemplate, sceneFromTemplate } from './stage/director';

import { testplate } from './data/testplate';
import './App.css';
import { Scene } from './stage/stage';

const videoSrc = '/assets/sample.mp4';
const generatedSrc2 = new URL('/bin/out2.mp4', import.meta.url).href;

const videoData = {
    duration: 28, // seconds
    fps: 30,
    height: 1080,
    width: 1920,
}

function App() {

    const [frames, setFrames] = useState<string[]>([]);

    useEffect(() => {
        testFrameGeneration();
    }, []);
    
    async function testFrameGeneration() {
        const renderedFrames: string[] = [];
        for (let i = 0; i < 5; i++) {
            const frame = sceneFrameFromTemplate(testplate, i * 30, i);
            // console.log(`frame${i}`, frame);
            const render = await invoke('renderFrame', { payload: frame });
            // console.log(`render${i}`, render);
            renderedFrames.push(render as string);
            setFrames(renderedFrames);
        }
        console.log(renderedFrames);
    }

    async function renderVideo(payload: Scene[]) {
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
                <h2>Generated Frames</h2>
                {
                    frames.map((src, idx) => (
                        <div key={idx}>
                            <img className='pane'
                                src={src}
                            />
                        </div>
                    ))
                }
            </div>

            <div>
                <h2>Render</h2>
                <div>
                    <button
                        onClick={() => renderVideo(
                            sceneFromTemplate(testplate, videoData.duration, videoData.fps)
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
