export class animation
{
    constructor(x, y, width, height, Frames, updateInterval, isActive, isAbsolute, loop = true)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isAbsolute = isAbsolute;
        this.isActive = isActive;
        this.loop = loop;

        this.Frames = Frames;
        this.updateInterval = updateInterval;
        this.step = 0;
        this.alpha = 1;
        this.behaviour = [];
    }

    setActive(active)
    {
        this.isActive = active;
    }

    setAlpha(alpha)
    {
        this.alpha = alpha;
    }

    update(frame)
    {
        if(this.isActive)
        {

            this.updateBehaviour(frame);
            
            
            
            if(frame % this.updateInterval == 0)
                {
                    this.step++;
                    if(this.step >= this.Frames.length)
                        {
                            this.step = 0;
                            if(!this.loop)
                            {
                                this.setActive(false);
                            }
                        }
                    }
                }
        }

    manipulateAnimation(command, values)
    {
        try
        {
        switch(command)
        {
            case "move":
                this.x += values[0];
                this.y += values[1];
                break;
            case "teleport":
                this.x = values[0];
                this.y = values[1];
                break;
            case "setFrame":
                this.step = values;
                break;
            case "setUpdateFrequency":
                this.updateInterval = values;
        }
        }
        catch
        {
            console.error("Critical Error in Animation-Command");
        }
    }


    updateBehaviour(frame)
    {
        this.behaviour.forEach(behaviour => {
            switch(behaviour[0])
            {
            case "move":
                this.x += behaviour[1];
                this.y += behaviour[2];
                break;
            case "teleport":
                this.x = behaviour[1];
                this.y = behaviour[2];
                break;
            case "conditionTeleportX":
                if(frame % behaviour[1] == 0)
                {
                    this.x = behaviour[1];
                }
                break;
            case "conditionTeleportY":
                if(frame % behaviour[1] == 0)
                {
                    this.y = behaviour[1];
                }
                break;
            case "killSelfOnPositionX":
                if(this.x >= behaviour[1])
                {
                    this.setActive(false);
                }
                break;
            }
        })
    }

    drawSelf(ctx)
    {
        if(this.isActive)
        {
            ctx.globalAlpha = this.alpha;
            ctx.drawImage(this.Frames[this.step], this.x, this.y, this.width, this.height);
            ctx.globalAlpha = 1;
        }
    }
}


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

