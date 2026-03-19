

// UI Manager for all UI-Elements
export const UIManager = 
            {
                elements: [],
                
                add(element) 
                {
                    this.elements.push(element);

                    this.elements.sort((a, b) => a.zPosition - b.zPosition);
                },

                handleClick(mouseX, mouseY) 
                {
                    for (let i = 0; i < this.elements.length; i++) 
                    {
                        const element = this.elements[i];

                        if (!element.active) continue;

                        // Check panel children first (topmost)
                        if (element.components) 
                        {
                            for (let j = element.components.length - 1; j >= 0; j--) 
                            {
                                const child = element.components[j];

                                if (child.active && child.hitTest(mouseX, mouseY, camera)) 
                                {
                                    child.onClick();
                                    return true;
                                }
                            }
                        }

                        // Check the element itself
                        if (element.hitTest(mouseX, mouseY, camera)) 
                        {
                            element.onClick();
                            return true;
                        }
                    }

                    return false;
                },

                onHoverCheck(mouseX, mouseY, ctx)
                {
                    for (let i = this.elements.length - 1; i >= 0; i--) 
                    {
                        const element = this.elements[i];

                        if (!element.active) continue;

                        // Check panel children first (topmost)
                        if (element.components) 
                        {
                            for (let j = element.components.length - 1; j >= 0; j--) 
                            {
                                const child = element.components[j];

                                if (child.active && child.hitTest(mouseX, mouseY, camera)) 
                                {
                                    child.onHover(ctx);
                                    return true;
                                }
                            }
                        }

                        // Check the element itself
                        if (element.hitTest(mouseX, mouseY, camera)) 
                        {
                            element.onHover(ctx);
                            return true;
                        }
                    }

                    return false;
                },

                draw(ctx, absolute) 
                {
                    if(absolute)
                    {
                        this.elements.forEach(element => 
                        {
                            if(element.isAbsolute)
                            {
                                element.drawSelf(ctx);
                            }
                        });
                    }
                    else
                    {
                        this.elements.forEach(element => 
                        {
                            if(!element.isAbsolute)
                            {
                                element.drawSelf(ctx);
                            }
                        });    
                    }
                }
            };





            // camera object
            export const camera = {
                x: 0,
                y: 0
            };



export const AnimationManager =
{
    elements: [],
                
    add(element) 
    {
        this.elements.push(element);
    },

    callUpdate(frame)
    {
        this.elements.forEach(element => 
                        {
  
                                element.update(frame);
                        });
    },


    draw(ctx, absolute) 
                {
                    if(absolute)
                    {
                        this.elements.forEach(element => 
                        {
                            if(element.isAbsolute)
                            {
                                element.drawSelf(ctx);
                            }
                        });
                    }
                    else
                    {
                        this.elements.forEach(element => 
                        {
                            if(!element.isAbsolute)
                            {
                                element.drawSelf(ctx);
                            }
                        });    
                    }
                }
}

