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
    const [imutDiarisation, setImutDiarisation] = useState<Record<string, number[][]>>({});
    const [mutDiarisation, setMutDiarisation] = useState<Record<string, number[][]>>({});
    const [audioSplit, setAudioSplit] = useState<Record<string, number[][] | undefined>>({});

    const [speakerMap, setSpeakerMap] = useState<Record<string, string>>({
        'kiwi': 'null',
        'pengwyn': 'null',
        'none': 'null',
    });

    const [scene, setScene] = useState<Scene | null>(null);

    const [frames, setFrames] = useState<string[]>([]);
    const [rendered, setRendered] = useState<boolean | undefined>(false);

    const isDiarisingRef = useRef(false);
    const lastDiarisationRef = useRef<string | null>(null);

    const audioCtxRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        setTemplate({ ...trueTemplate });
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
        setImutDiarisation({});
        setMutDiarisation({});
        setRendered(false);
        setSpeakerMap({
            // empty values for default
            'kiwi': 'null',
            'pengwyn': 'null',
            'none': 'null',
        });
    }, [videoData]);

    useMemo(() => {
        if (audioData) {
            diariseAudio();
        }
    }, [audioData]);

    useMemo(() => {
        const filterEnabled = (spans?: number[][]) => spans?.filter(([a]) => a >= 0);
        setAudioSplit({
            'kiwi': filterEnabled(mutDiarisation?.[speakerMap?.['kiwi']]),
            'pengwyn': filterEnabled(mutDiarisation?.[speakerMap?.['pengwyn']]),
        });
    }, [mutDiarisation, speakerMap]);

    useMemo(() => {
        if (template && videoData) {
            generatePreviewFrame();
            if (audioData && audioSplit) {
                sceneFromTemplate(template, [videoData], audioData, audioSplit)
                    .then(scene => setScene(scene));
            }
        }
    }, [template, videoData, audioData, audioSplit]);

    useMemo(() => {
        // convert immutable diarisation to mutable
        setMutDiarisation({ ...imutDiarisation });
    }, [imutDiarisation]);

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
                setImutDiarisation(JSON.parse(diarisation));
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

    function addSpeaker() {
        const count = Object.keys(mutDiarisation).length
        const name = `SPEAKER_${count <= 9 ? '0' : ''}${count}`;
        if (!name) {
            return;
        }

        setMutDiarisation(prev => {
            if (prev[name]) {
                return prev;
            }
            return { ...prev, [name]: [] };
        });
    }

    function addSpan(speaker: string) {
        const start = prompt('Span start (seconds)');
        const end = prompt('Span end (seconds)');
        if (start === null || end === null) {
            return;
        }

        const a = Number(start);
        const b = Number(end);
        if (Number.isNaN(a) || Number.isNaN(b) || b <= a) {
            return;
        }

        setMutDiarisation(prev => {
            const next = { ...prev };
            next[speaker] = [...(next[speaker] ?? []), [a, b]];
            return next;
        });
    }

    function toggleSpan(speaker: string, index: number) {
        setMutDiarisation(prev => {
            const next = { ...prev };
            const spans = [...next[speaker]];

            const span = spans[index];
            // convention: disabled span = negative times
            spans[index] = span[0] >= 0
                ? [-span[0], -span[1]]
                : [-span[0], -span[1]];

            next[speaker] = spans;
            return next;
        });
    }

    function toggleProp(propID: string) {
        const newTemplate = { ...template };
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

    function playSpan(
        ctx: AudioContext,
        buffer: AudioBuffer,
        start: number,
        end: number,
        atTime: number
    ): number {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);

        const duration = end - start;
        source.start(atTime, start, duration);

        return atTime + duration;
    }

    function playSpans(spans?: number[][]) {
        if (!audioData || !spans?.length) return;

        if (!audioCtxRef.current) {
            audioCtxRef.current = new AudioContext();
        }

        const ctx = audioCtxRef.current;

        const buffer = ctx.createBuffer(
            1,
            audioData.length,
            videoData!.audioSampleRate
        );

        buffer.copyToChannel(Float32Array.from(audioData as any), 0);

        let t = ctx.currentTime;

        spans.forEach(([start, end]) => {
            if (start < 0 || end < 0) return;
            t = playSpan(ctx, buffer, start, end, t);
        });
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
                                        {Object.entries(mutDiarisation).map(([key, value]) => (
                                            <li className='audioItem' key={key}>
                                                <span className='speakerLabel'>{key}</span>
                                                <div className='audioControls'>
                                                    {value.map((v, i) => {
                                                        const disabled = v[0] < 0 || v[1] < 0;
                                                        return (
                                                            <span
                                                                key={i}
                                                                className={`audioChip ${disabled ? 'disabled' : 'enabled'}`}
                                                                onClick={() => toggleSpan(key, i)}
                                                            >
                                                                [{Math.abs(v[0])}–{Math.abs(v[1])}]
                                                            </span>
                                                        );
                                                    })}
                                                    <select
                                                        value={Object.entries(speakerMap).find(([_, speaker]) => speaker === key)?.[0] ?? 'none'}
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
                                                <button onClick={() => addSpan(key)}>
                                                    Add Span
                                                </button>
                                                <button onClick={() => playSpans(mutDiarisation[key])}>
                                                    ▶ Play
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                    <button onClick={addSpeaker}>
                                        Add Speaker
                                    </button>
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
