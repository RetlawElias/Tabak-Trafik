export function loadFrames(path, count, steps = 1) 
{
    const frames = [];

    for (let i = 1; i < count + 1; i += steps)     
    {
        if(i >= 10)
        {
            if(i >= 100)
            {
                const img = new Image();
                img.src = `${path}/0${i}.png`; // adjust naming
                frames.push(img);
            }
            else
            {
                const img = new Image();
                img.src = `${path}/00${i}.png`; // adjust naming
                frames.push(img);
            }
        }
        else
        {
            const img = new Image();
            img.src = `${path}/000${i}.png`; // adjust naming
            frames.push(img);
        }
    }

    return frames;
}