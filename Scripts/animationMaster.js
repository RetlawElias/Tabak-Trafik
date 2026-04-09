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

export function loadHirable(path, name, count, steps = 1) 
{
    const frames = [];

    for (let i = 1; i < count + 1; i += steps)     
    {
        const imgB = new Image();
        try{
            imgB.src = `${path}/${name}Bottom.png`; // adjust naming
        }
        catch(error)
        {
            imgB.src = `${path}/WorkerBottom.png`; // adjust naming
        }
        const imgT = new Image();
        try {
            imgT.src = `${path}/${name}Top.png`; // adjust naming
        }
        catch (error)
        {
            imgT.src = `${path}/$WorkerTop.png`; // adjust naming
        }
        frames.push([imgB, imgT]);
    }
    

    return frames;
}