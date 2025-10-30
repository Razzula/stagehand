import { useEffect, useMemo, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

import { sceneFromTemplate, CustomVideoAsset } from './stage/director';
import { testplate } from './data/testplate';
import { Scene } from './stage/stage';

import './App.scss';
import { Template } from './stage/Template';

const STAGEHAND_DIR = '/media/razzula/media2/Programming/Web/';

function App() {

    const [trueTemplate, _setTrueTemplate] = useState<Template>(testplate);
    const [template, setTemplate] = useState<Template>(testplate);

    const [videoName, setVideoName] = useState<string | null>(null);

    const [videoData, setVideoData] = useState<CustomVideoAsset | null>(null);
    const [audioData, setAudioData] = useState<Float32Array | null>(null);
    const [diarisation, setDiarisation] = useState<Record<string, number[][]>>({});
    const [audioSplit, setAudioSplit] = useState<Record<string, number[][]>>({});

    const [speakerMap, setSpeakerMap] = useState<Record<string, string>>({
        'kiwi': 'SPEAKER_00',
        'pengwyn': 'SPEAKER_01',
    });

    const [scene, setScene] = useState<Scene | null>(null);

    const [frames, setFrames] = useState<string[]>([]);
    const [rendered, setRendered] = useState<boolean | undefined>(false);

    const isDiarisingRef = useRef(false);
    const lastDiarisationRef = useRef<string | null>(null);

    useEffect(() => {
        setTemplate({...trueTemplate});
    }, [trueTemplate]);

    useEffect(() => {
        if (videoName) {
            const src = `/assets/${videoName}.mp4`;
            invoke<CustomVideoAsset>('getVideoData', { path: `${STAGEHAND_DIR}/stagehand/public/${src}` })
                .then(data => {
                    setVideoData({
                        id: videoName,
                        src: src,
                        height: data.height,
                        width: data.width,
                        durationSec: data.durationSec,
                        audioSampleRate: data.audioSampleRate,
                        datetime: new Date(data.datetime), // convert ISO string to Date
                    });
                });
        }
    }, [videoName]);

    useMemo(() => {
        extractAudio();
        setDiarisation({});
        setRendered(false);
        setSpeakerMap({
            'kiwi': 'SPEAKER_00',
            'pengwyn': 'SPEAKER_01',
        });
    }, [videoData]);

    useMemo(() => {
        if (audioData) {
            diariseAudio();
        }
    }, [audioData]);

    useMemo(() => {
        setAudioSplit({
            'kiwi': diarisation?.[speakerMap?.['kiwi']],
            'pengwyn': diarisation?.[speakerMap?.['pengwyn']]
        });
    }, [diarisation, speakerMap]);

    useMemo(() => {
        if (template && videoData) {
            generatePreviewFrame();
            if (audioData && audioSplit) {
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

    async function updateVideoSource() {
        const name = prompt('video source name');
        if (name && name !== videoName) {
            setVideoName(name);
        }
    }

    function toggleProp(propID: string) {
        const newTemplate = {...template};
        [...newTemplate.heads, ...newTemplate.others].forEach(prop => {
            if (prop.id === propID) {
                if (prop.disabled === undefined) {
                    prop.disabled = true;
                }
                else {
                    prop.disabled = !prop.disabled;
                }
            }
        });
        setTemplate(newTemplate);
    }

    return (
        <div className={`${videoName ? 'quarterise' : 'section'} main`}>

            {/* Top Row */}
            <div className='section'>
                <h2>Assets</h2>
                <div className='scroller'>

                    <div className='section'>
                        <div>{'testplate'}</div>
                        <div>{videoData?.src}</div>
                        <button
                            onClick={updateVideoSource}
                            disabled={rendered === undefined}
                        >
                            {videoName ? 'Change' : 'Select'} Clip
                        </button>
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
                                    <img className={`pane ${prop.disabled ? 'propDisabled' : 'propEnabled'}`}
                                        src={new URL(prop.sprites?.[0], import.meta.url).href}
                                        onClick={() => toggleProp(prop.id)}
                                    />
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>

            {videoName &&
                <>
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
                            <video className='pane' src={new URL(`/bin/${videoData?.id}.mp4`, import.meta.url).href} controls />
                        }
                        {rendered === false &&
                            <button
                                onClick={renderVideo}
                                disabled={scene === null}
                            >
                                {scene ? 'Render Video' : 'Loading...'}
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
                        <div>
                            <h3>Audio</h3>
                            {isDiarisingRef.current ? (
                                'Diarising...'
                            ) : (
                                <div className='audioList'>
                                    <ul>
                                        {Object.entries(diarisation).map(([key, value]) => (
                                            <li className='audioItem' key={key}>
                                                <span className='speakerLabel'>{key}</span>
                                                <div className='audioControls'>
                                                    <div className='audioValues'>
                                                        {value.map((v, i) => (
                                                            <span key={i} className='audioChip'>[{v[0]}–{v[1]}]</span>
                                                        ))}
                                                    </div>
                                                    <select
                                                        value={Object.entries(speakerMap).find(([_, speaker]) => speaker === key)?.[0] ?? ''}
                                                        onChange={(e) => {
                                                            const chosenCharacter = e.target.value;
                                                            setSpeakerMap(prev => ({ ...prev, [chosenCharacter]: key }));
                                                        }}
                                                    >
                                                        {Object.keys(speakerMap).map(character => (
                                                            <option key={character} value={character}>
                                                                {character}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div>
                            <h3>Video</h3>
                            <button
                                onClick={renderVideo}
                                disabled={scene === null}
                            >
                                {scene ? 'Render Video' : 'Loading...'}
                            </button>
                        </div>
                    </div>
                </>
            }

        </div>
    );
}

export default App;
