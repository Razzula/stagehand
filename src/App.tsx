import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

import { testplate } from './data/testplate';

import './App.css';
import CanvasScene from './CanvasScene';

const videoSrc = new URL('/assets/sample.mp4', import.meta.url).href;
const generatedSrc = new URL('/bin/out.mp4', import.meta.url).href;

function App() {

    async function renderBasicVideo(templateImage: string, videoFile: string, outputFile: string) {
        const temp = await invoke('renderBasicVideo', { templateImage, videoFile, outputFile });
        alert(temp);
    }

    return (
        <div>

            <div>
                <h2>Video</h2>
                <video className='pane'
                    src={videoSrc} controls={true}
                />
                <h2>Template</h2>
                <img className='pane'
                    src={testplate.background}
                />
            </div>

            <div>
                <h2>React Render</h2>
                <CanvasScene
                    template={testplate}
                />
            </div>

            <div>
                <h2>FFMPEG Render</h2>
                <div>
                    <button
                        onClick={() => renderBasicVideo(testplate.background, videoSrc, '/media/razzula/media2/Programming/Web/stagehand/bin/out.mp4')}
                        >
                        Render Video!
                    </button>
                </div>
                <video className='pane'
                    src={generatedSrc} controls={true}
                />
            </div>

        </div>
    );
}

export default App;
