import { useEffect, useMemo, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

import { sceneFromTemplate, CustomVideoAsset } from './stage/director';
import { testplate } from './data/testplate';
import { Scene } from './stage/stage';

import './App.scss';

const STAGEHAND_DIR = '/media/razzula/media2/Programming/Web/';

const generatedSrc2 = new URL('/bin/out2.mp4', import.meta.url).href;

function App() {

    const [template, _setTemplate] = useState(testplate);

    const [videoData, setVideoData] = useState<CustomVideoAsset | null>(null);
    const [audioData, setAudioData] = useState<Float32Array | null>(null);
    const [diarisation, setDiarisation] = useState<Record<string, number[][]>>({});
    const [audioSplit, setAudioSplit] = useState<Record<string, number[][]>>({});

    const [scene, setScene] = useState<Scene | null>(null);
    
    const [frames, setFrames] = useState<string[]>([]);
    const [rendered, setRendered] = useState<boolean | undefined>(false);

    const isDiarisingRef = useRef(false);
    const lastDiarisationRef = useRef<string | null>(null);

    useEffect(() => {
        setVideoData({
            id: 'sample',
            src: '/assets/sample.mp4',
            height: 1080,
            width: 1920,
            durationSec: 28,
            audioSampleRate: 48000,
            datetime: new Date(Date.UTC(2023, 5, 7, 23, 59, 54)),
            // datetime: new Date(Date.UTC(2023, 5, 7, 22, 58, 54)),
        });
    }, []);

    useMemo(() => {
        extractAudio();
    }, [videoData]);

    useMemo(() => {
        if (audioData) {
            diariseAudio();
        }
    }, [audioData]);

    useMemo(() => {
        setAudioSplit({
            'kiwi': diarisation?.['SPEAKER_01'],
            'pengwyn': diarisation?.['SPEAKER_00']
        });
    }, [diarisation]);

    useMemo(() => {
        if (template && videoData)  {
            generatePreviewFrame();
            if (audioData && audioSplit)  {
                sceneFromTemplate(template, [videoData], audioData, audioSplit)
                    .then(scene => setScene(scene));
            }
        }
    }, [template, videoData, audioData, audioSplit]);

    async function generatePreviewFrame() {
        if (videoData) {
            const scene = await sceneFromTemplate(template, [videoData], audioData, audioSplit);
            const singleFrameScene: Scene = { ...scene, frames: [scene.frames[0]] };
            const render = await invoke('renderFrame', { payload: singleFrameScene });
            setFrames([render as string]);
        }
    }

    async function extractAudio() {
        if (videoData) {
            const floatSamples = await invoke('extractAudio', {
                videoPath: `${STAGEHAND_DIR}/stagehand/public/${videoData.src}`,
                audioSampleRate: videoData.audioSampleRate,
            }) as Float32Array;
            if (floatSamples !== audioData) {
                setAudioData(floatSamples);
            }
        }
    }

    async function diariseAudio() {
        if (isDiarisingRef.current) {
            return;
        }
        isDiarisingRef.current = true;

        try {
            const diarisation = await invoke('diariseAudio') as string;
            if (diarisation !== lastDiarisationRef.current) {
                lastDiarisationRef.current = diarisation;
                setDiarisation(JSON.parse(diarisation));
            }
        }
        catch (e) {
            console.error('Diarisation failed', e);
        }
        finally {
            // small delay to avoid immediate re-trigger from file churn
            setTimeout(() => { isDiarisingRef.current = false; }, 250);
        }
    }

    async function renderVideo() {
        if (scene) {
            setRendered(undefined);
            await invoke('renderVideo', { payload: scene });
            setRendered(true);
        }
        else {
            console.error('Scene not computed');
        }
    }

    return (
        <div className='quarterise main'>

            {/* Top Row */}
            <div className='section'>
                <h2>Assets</h2>
                <div className='scroller'>

                    <div className='section'>
                        <div>{'testplate'}</div>
                        <div>{videoData?.src}</div>
                    </div>

                    <div className='section'>
                        {/* <h2>Video</h2> */}
                        <video className='pane'
                            src={new URL(videoData?.src ?? '', import.meta.url).href} controls
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
                            [...template.heads, ...template.others].map(prop => (
                                <img className='pane'
                                    src={new URL(prop.sprites?.[0], import.meta.url).href}
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
                        onClick={renderVideo}
                        disabled={scene === null}
                    >
                        { scene ? 'Render Video' : 'Loading...' }
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
                    onClick={renderVideo}
                    disabled={scene === null}
                >
                    { scene ? 'Render Video' : 'Loading...' }
                </button>
            </div>

        </div>
    );
}

export default App;
