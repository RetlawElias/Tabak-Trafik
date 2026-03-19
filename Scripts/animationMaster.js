export class animation
{
    constructor(x, y, width, height, Frames, updateInterval, isActive, isAbsolute)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isAbsolute = isAbsolute;
        this.isActive = isActive;

        this.Frames = Frames;
        this.updateInterval = updateInterval;
        this.step = 0;
        this.alpha = 1;
        this.behaviour = [];
    }

    setAlpha(alpha)
    {
        this.alpha = alpha;
    }

    update(frame)
    {
        this.updateBehaviour(frame);

        if(frame % this.updateInterval == 0)
        {
            this.step++;
            if(this.step >= this.Frames.length)
            {
                this.step = 0;
            }
        }
    }

    updateBehaviour(frame)
    {
        switch(this.behaviour[0])
        {
            case "move":
                this.x += this.behaviour[1];
                this.y += this.behaviour[2];
                break;
            case "teleport":
                this.x = this.behaviour[1];
                this.x = this.behaviour[2];
                break;
            case "conditionTeleportX":
                if(frame % this.behaviour[1] == 0)
                {
                    this.x = this.behaviour[1];
                }
            case "conditionTeleportY":
                if(frame % this.behaviour[1] == 0)
                {
                    this.y = this.behaviour[1];
                }
        }
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