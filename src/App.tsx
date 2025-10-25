import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { sceneFromTemplate, CustomVideoAsset } from './stage/director';
import { testplate } from './data/testplate';
import { Scene } from './stage/stage';

import './App.scss';

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

    const [rendered, setRendered] = useState<boolean | undefined>(false);

    useEffect(() => {
        testFrameGeneration();
    }, []);

    async function testFrameGeneration() {
        const scene = await sceneFromTemplate(template, [videoData], audioSplit);
        const frameAsScene: Scene = { ...scene, frames: [scene.frames[0]] };
        const render = await invoke('renderFrame', { payload: frameAsScene });
        setFrames([render as string]);
    }

    async function renderVideo(payload: Scene) {
        setRendered(undefined);
        await invoke('renderVideo', { payload });
        setRendered(true);
    }

    return (
        <div className='quarterise main'>

            {/* Top Row */}
            <div className='section'>
                <h2>Assets</h2>
                <div className='scroller'>

                    <div className='section'>
                        <div>{'testplate'}</div>
                        <div>{videoData.src}</div>
                    </div>

                    <div className='section'>
                        {/* <h2>Video</h2> */}
                        <video className='pane'
                            src={new URL(videoData.src, import.meta.url).href} controls
                        />
                    </div>

                    <div className='section'>
                        {/* <h2>Template</h2> */}
                        <img className='pane'
                            src={new URL(template.background.image, import.meta.url).href}
                        />
                    </div>

                    <div className='section'>
                        <div className='quaterise'>
                        {
                            template.heads.map(head => (
                                <img className='pane'
                                    src={new URL(head.sprites?.[0], import.meta.url).href}
                                    // style={{
                                    //     width: head.width, height: head.height,
                                    // }}
                                />
                            ))
                        }
                        </div>
                    </div>
                </div>
            </div>

            <div className='section'>
                <h2>Preview</h2>
                {frames[0] && <img className='pane' src={frames[0]} />}
            </div>

            {/* Bottom Row */}
            <div className='section'>
                <h2>
                    Render{rendered ? 'ed' : (rendered === undefined ? 'ing' : '')} Video
                </h2>
                {rendered &&
                    <video className='pane' src={generatedSrc2} controls />
                }
                {rendered === false &&
                    <button
                        onClick={() => sceneFromTemplate(template, [videoData], audioSplit)
                            .then(scene => renderVideo(scene))
                        }
                    >
                        Render Video
                    </button>
                }
                {rendered === undefined &&
                    <div className='loader'>
                        Loading...
                    </div>
                }
            </div>

            <div className='section'>
                <h2>Controls</h2>
                <button
                    onClick={() => sceneFromTemplate(template, [videoData], audioSplit)
                        .then(scene => renderVideo(scene))
                    }
                >
                    Render Video
                </button>
            </div>

        </div>
    );
}

export default App;
