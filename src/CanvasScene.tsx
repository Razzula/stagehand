import { JSX, useEffect, useRef } from 'react';

import { Template } from './Template';

interface CanvasSceneProps {
    template: Template;
}

export function CanvasScene({template}: CanvasSceneProps): JSX.Element {
    
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) {   
            return;
        }

        // XXX magic numbers!
        const width = 800;
        const height = 600;
        canvas.width = width;
        canvas.height = height;

        // load images
        const background = new Image();
        background.src = template.background;
        const headA = new Image();
        headA.src = template.heads[0].image;

        let frame = 0;
        
        const animate = () => {
            if (!ctx) {
                return;
            }
            ctx.clearRect(0, 0, width, height);
            
            // draw background
            ctx.drawImage(background, 0, 0, width, height);
            
            // fake audio RMS values for demo
            // compute simple bob (sine wave) per head
            // XXX magic numbers! not from audio
            const bobA = ((Math.sin(frame * 0.2) + 1) / 2) * -20;
            // const bobA = 0;
            // const twistA = Math.sin(frame * 0.2) / 20;

            // draw heads at offsets
            ctx.save();
            // ctx.rotate(twistA);
            ctx.drawImage(
                headA,
                // XXX magic numbers!
                (template.heads[0].origin.x / 1249) * width,
                (template.heads[0].origin.y / 957) * height + bobA,
                (205 / 1249) * width,
                (130 / 957) * height,
            );
            ctx.restore();

            frame++;
            requestAnimationFrame(animate);
        };

        // wait until images loaded
        const loadAll = Promise.all([background.decode(), headA.decode()]);
        loadAll.then(() => {
            console.log('animate!');
            animate();
        });
    }, []);

    return (
        <div>
            <canvas ref={canvasRef} className='pane' />
        </div>
    );
};

export default CanvasScene;
