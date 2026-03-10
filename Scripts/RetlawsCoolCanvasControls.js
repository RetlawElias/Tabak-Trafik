// Texture Struct for Buttons
export function canvasButtonTexture(texture, color = "", text = "")
        {
            this.texture = texture;
            this.color = color;
            this.text = text;
        }


// Texture Struct for Panels
export function canvasPannelTexture(texture, color = "")
        {
            this.texture = texture;
            this.color = color;
        }



// Parent for all canvas-elements
export class canvasElement 
{
    constructor(x,y, sizeX, sizeY, Texture, isAbsolute, isActive = true, offset = [0,0])
    {
        this.x = x;
        this.y = y;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.Texture = Texture;
        this.blocksInput = true;
        this.isAbsolute = isAbsolute;
        this.active = isActive;
        this.alpha = 1;
        this.offset = offset;
    }

    setActive(setActive)
    {
        if(setActive)
        {
            this.active = true;
        }
        else
        {
            this.active = false;
        }
    }
    
    setAlpha(alpha)
    {
        this.alpha = alpha;
    }

    // Automated by dom.js/UIManager/draw()
    drawSelf(ctx)
    {
        if(this.active)
        {
            if(this.Texture.texture !== "")
            {
                ctx.globalAlpha = this.alpha;
                ctx.drawImage(this.Texture.texture, this.x, this.y, this.sizeX, this.sizeY);
                ctx.globalAlpha = 1;
            }
            else
            {
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.Texture.color;
                ctx.fillRect(this.x, this.y, this.sizeX, this.sizeY);
                ctx.globalAlpha = 1;
            }
        }
    }            

    // Automated by dom.js/UIManager/handleClick()
    hitTest(mouseX, mouseY, camera = null)
            {
                if(this.isAbsolute)
                {
                    const result =
                    mouseX >= this.x &&
                    mouseX <= this.x + this.sizeX &&
                    mouseY >= this.y &&
                    mouseY <= this.y + this.sizeY;

                    return result;
                }
                else
                {
                    const result =
                    mouseX + camera.x >= this.x &&
                    mouseX + camera.x <= this.x + this.sizeX &&
                    mouseY >= this.y &&
                    mouseY <= this.y + this.sizeY;

                    return result;
                }
            }

    onClick()
    {
        console.log("Item has been clicked");
    }
}
        
        
// Buttons
export class canvasButton extends canvasElement
        {
            constructor(x,y, sizeX, sizeY, Texture, isAbsolute, isActive = true, offset = [0,0])
            {
                super(x,y,sizeX,sizeY,Texture,isAbsolute,isActive,offset);
            }

            
            drawSelf(ctx) 
            {
                super.drawSelf(ctx);

                if (this.Texture.text !== "" && this.active)
                    {
                        ctx.globalAlpha = this.alpha;

                        const text = this.Texture.text;
                        const paddingX = this.sizeX * 0.1; // 10% horizontal padding
                        const paddingY = this.sizeY * 0.2; // vertical breathing room
                        
                        
                        if (!text) return;
                        
                        const maxTextWidth = this.sizeX - paddingX * 2;
                        let fontSize = Math.floor(this.sizeY * 0.45); // start large
                        
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillStyle = "black";
                        
                        // Shrink-to-fit loop
                        do
                        {
                            ctx.font = `${fontSize}px Arial`;
                            fontSize--;
                        }
                        while (ctx.measureText(text).width > maxTextWidth && fontSize > 8);
                        
                        // Centered draw
                        ctx.fillText(
                            text,
                            this.x + this.sizeX / 2,
                            this.y + this.sizeY / 2
                        );
                        ctx.globalAlpha = 1;
                    }
            }
            


            // OBSOLETE (No UIManager Supported use)
            onClickCheck = function(cursorX, cursorY, clientClick)
            {
                if(this.active)
                {
                    if(cursorX >= this.x && cursorX <= this.x + this.sizeX &&
                    cursorY >= this.y && cursorY <= this.y + this.sizeY)
                    {
                        this.onHover(clientClick);
                        return true;
                    }

                return false;
                }
            }

            // OBSOLETE (No UIManager Supported use)
            onHover = function(clientClick)
            {
                console.log("Hovered the Button");
                if(clientClick)
                {
                    this.onClick();
                }   
            }

            
        }



// Panels
export class canvasPannel extends canvasElement
        {
            
            constructor(x,y, sizeX, sizeY, Texture, isAbsolute, isActive, offset = [0,0])
            {
                super(x,y,sizeX,sizeY,Texture,isAbsolute,isActive,offset);
                this.components = [];
            }

            addChild(child)
            {
                this.components.push(child);
            }

            setActive(setActive)
            {
                if(setActive)
                {
                    this.active = true;
                    this.components.forEach(element => {
                        element.setActive(true);
                    });
                }
                else
                {
                    this.active = false;
                    this.components.forEach(element => {
                        element.setActive(false);
                    });
                }
            }


            containsPoint(x, y) 
            {
                return (
                    this.active &&
                    x >= this.x &&
                    x <= this.x + this.sizeX &&
                    y >= this.y &&
                    y <= this.y + this.sizeY
                );
            };

            // panel moves the techtree buttons with it
            drawSelf(ctx)
            {
                // draw the panel
                super.drawSelf(ctx);

                if(!this.active) return;

                // draw children
                this.components.forEach(element => {
                    element.drawSelf(ctx);
                });
            }
        }




// Specialized Buttons for Techtree purposes
export class techtreeUpgrade extends canvasElement
        {
            constructor(x,y, sizeX, sizeY, Texture, name, cost, condition, isAbsolute, isActive, offset = [0,0])
            {
                super(x,y,sizeX,sizeY,Texture,isAbsolute,isActive,offset);
                this.name = name;
                this.cost = cost;
                this.condition = condition;
                this.isBought = false;
            }

            
            drawConnections(ctx, objectArray)
            {
                
                // Connections
                if(this.condition.length > 0)
                    {
                    for(let i = 0; i < this.condition.length; i++)
                        {
                            for(let j = 0; j < objectArray.length; j++)
                                {
                                    if(this.condition[i] == objectArray[j].name)
                                    {

                                        const startX = objectArray[j].x + objectArray[j].sizeX / 2;
                                        const startY = objectArray[j].y + objectArray[j].sizeY;

                                        const endX = this.x + this.sizeX / 2;
                                        const endY = this.y;

                                        const midY = startY + (endY - startY) / 2;

                                        ctx.beginPath();
                                        ctx.lineWidth = 8;
                                        
                                        if(objectArray[j].isBought)
                                        {
                                            ctx.strokeStyle = "Green";   
                                        }
                                        else
                                        {
                                            ctx.strokeStyle = "Black";
                                        }
                                            
                                        ctx.moveTo(startX, startY);
                                        ctx.lineTo(startX, midY);
                                        ctx.lineTo(endX, midY);
                                        ctx.lineTo(endX, endY);
                                        ctx.stroke();
                                }
                            }
                        }
                }
            }

            
            drawSelf(ctx)
            {
                
                if(this.active)
                {
                    // Draw Item
                    if(this.Texture.texture !== "")
                    {
                        ctx.globalAlpha = this.alpha;
                        ctx.drawImage(this.Texture.texture, this.x, this.y, this.sizeX, this.sizeY);
                        ctx.globalAlpha = 1;
                    }
                    else
                    {
                        ctx.globalAlpha = this.alpha;
                        ctx.fillStyle = this.Texture.color;
                        ctx.fillRect(this.x, this.y, this.sizeX, this.sizeY);
                        ctx.globalAlpha = 1;
                    }
                
                        

                // Text
                if (this.Texture.text !== "")
                {
                    // Draw text (fitted)
                    const text = this.Texture.text;
                    const paddingX = this.sizeX * 0.1; // 10% horizontal padding
                    const paddingY = this.sizeY * 0.2; // vertical breathing room
                    

                    if (!text) return;
                    
                    const maxTextWidth = this.sizeX - paddingX * 2;
                    let fontSize = Math.floor(this.sizeY * 0.45); // start large
                    
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = "black";
                    
                    // Shrink-to-fit loop
                    do
                    {
                        ctx.font = `${fontSize}px Arial`;
                        fontSize--;
                    }
                    while (ctx.measureText(text).width > maxTextWidth && fontSize > 8);
                    
                    // Centered draw
                    ctx.fillText(
                        text,
                        this.x + this.sizeX / 2,
                        this.y + this.sizeY / 2 
                    );
                }
                }
            }
        }


export class particleEmitter extends canvasElement
{
    constructor(x, y, particleSize, particleTexture/* Use CanvasTexture Object */, PSPU,  minVelocity, maxVelocity, particleLifetime, emitterlifetime, gravity = false, drag = 0, isActive = true, isAbsolute = true, offset = [0,0])
    {
        super(x,y,particleSize,particleSize,particleTexture,isAbsolute,isActive,offset);

        this.PSPU = PSPU; // Particles Spawned Per Update
        this.minVelocity = minVelocity;
        this.maxVelocity = maxVelocity;
        this.emitterlifetime = emitterlifetime;
        this.particleLifetime = particleLifetime;
        this.gravity = gravity;
        this.drag = drag;


        this.particleChildren = [];
    }

    spawnParticle()
    {
        // Decimal
        if(this.PSPU % 1 !== 0)
        {
            for(let i = 0; i < Math.floor(this.PSPU); i++)
            {
                this.particleChildren.push(
                    new particle(
                        this.x, 
                        this.y, 
                        this.sizeX, 
                        this.Texture, 
                        [(Math.random() - 0.5) * 2 * Math.max(this.minVelocity, Math.random() * this.maxVelocity),(Math.random() - 0.5) * 2 * Math.max(this.minVelocity, Math.random() * this.maxVelocity)], 
                        this.particleLifetime, 
                        this.alpha, 
                        this.isAbsolute, 
                        this.isActive, 
                        this.offset
                    )
                );
            }

            if(Math.round(Math.random() * 100) < (this.PSPU % 1) * 100)
            {
                this.particleChildren.push(
                    new particle(
                        this.x, 
                        this.y, 
                        this.sizeX, 
                        this.Texture, 
                        [(Math.random() - 0.5) * 2 * Math.max(this.minVelocity, Math.random() * this.maxVelocity),(Math.random() - 0.5) * 2 * Math.max(this.minVelocity, Math.random() * this.maxVelocity)], 
                        this.particleLifetime, 
                        this.alpha, 
                        this.isAbsolute, 
                        this.isActive, 
                        this.offset
                    )
                );
            }
        }
        else
        {
            for(let i = 0; i < Math.floor(this.PSPU); i++)
            {
                this.particleChildren.push(
                    new particle(
                        this.x, 
                        this.y, 
                        this.sizeX, 
                        this.Texture, 
                        [(Math.random() - 0.5) * 2 * Math.max(this.minVelocity, Math.random() * this.maxVelocity),(Math.random() - 0.5) * 2 * Math.max(this.minVelocity, Math.random() * this.maxVelocity)], 
                        this.particleLifetime, 
                        this.alpha, 
                        this.isAbsolute, 
                        this.isActive, 
                        this.offset
                    )
                );
            }
        }
    }

    drawSelf(ctx)
    {
        this.emitterlifetime--;

        if(this.active)
        {
            for(let i = this.particleChildren.length - 1; i >= 0; i--)
                {
                    const p = this.particleChildren[i];
                    
                    p.updateFrame(this.gravity ? 0.02 : 0, this.drag);
                    
                    if(p.lifetime <= 0)
                        this.particleChildren.splice(i,1);
                    else
                        p.drawSelf(ctx);
                }
            }
    }
}



export class particle extends canvasElement
{
    constructor(x,y, particleSize, Texture, velocity, lifetime, alpha, isAbsolute, isActive = true, offset = [0,0])
    {
        super(x,y,particleSize,particleSize,Texture,isAbsolute,isActive,offset);

        this.lifetime = lifetime;
        this.alpha = alpha;

        const angle = Math.random() * Math.PI * 2;

        this.vx = velocity[0];
        this.vy = velocity[1];
    }

    updateFrame(gravity, drag)
    {
        this.vy += gravity;

        this.vx *= (1 - drag);
        this.vy *= (1 - drag);

        this.x += this.vx;
        this.y += this.vy;

        this.lifetime--;
    }
}

