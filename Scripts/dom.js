
// UI Manager for all UI-Elements
export class UIManager 
            {
                constructor() 
                {
                    this.elements = [];
                }
                
                add(element) 
                {
                    this.elements.push(element);

                    this.elements.sort((a, b) => a.zPosition - b.zPosition);
                }

                handleClick(mouseX, mouseY) 
                {
                    for (let i = 0; i < this.elements.length; i++) 
                    {
                        if(!this.elements[i].isAnimation)
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
                    }

                    return false;
                }

                onHoverCheck(mouseX, mouseY, ctx)
                {
                    for (let i = this.elements.length - 1; i >= 0; i--) 
                    {
                        if(!this.elements[i].isAnimation)
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
                    }

                    return false;
                }

                draw(ctx, absolute) 
                {
                    if(absolute)
                    {
                        for (let i = this.elements.length - 1; i >= 0; i--) 
                        {
                            if(this.elements[i].isAbsolute)
                            {
                                this.elements[i].drawSelf(ctx);
                            }
                        }
                    }
                    else
                    {
                        for (let i = this.elements.length - 1; i >= 0; i--) 
                        {
                            if(!this.elements[i].isAbsolute)
                            {
                                this.elements[i].drawSelf(ctx);
                            }
                        } 
                    }
                }


                callUpdate(frame)
                {
                    this.elements.forEach(element => 
                    {
                        //Check if item is an animation
                        if(element.isAnimation)
                        {
                            element.update(frame);
                        }
                    });
                }
            };

            

            export const SceneManager = {
                currentScene: null,
                scenes: {},
                globalUI: new UIManager(),
                
                setGlobalUI(UIManager)
                {
                    this.globalUI = UIManager;
                },

                addScene(name, uiManager) {
                    this.scenes[name] = uiManager;
                },

                setScene(name) {
                    this.currentScene = this.scenes[name];
                },

                handleClick(x, y) {
                    // Global UI gets priority
                    if (this.globalUI.handleClick(x, y)) return true;
                    
                    if (this.currentScene) {
                        return this.currentScene.handleClick(x, y);
                    }
                    return false;
                },

                onHover(x, y, ctx) {
                    if (this.globalUI.onHoverCheck(x, y, ctx)) return true;
                    
                    if (this.currentScene) {
                    return this.currentScene.onHoverCheck(x, y, ctx);
                }
                    return false;
                },
                    
                draw(ctx, absolute) {
                    if (this.currentScene) 
                    {
                        this.currentScene.draw(ctx, absolute);
                    }
                    
                    // Draw global on top
                    if(absolute)
                    {
                        this.globalUI.draw(ctx, true);
                    }
                },
                
            update(frame) {
                if (this.currentScene) {
                    this.currentScene.callUpdate(frame);
                }

                this.globalUI.callUpdate(frame);
            }
        };


            // camera object
            export const camera = {
                x: 0,
                y: 0
            };


export class func
{
    constructor(a,b,c,expo1,expo2,expo3, abs)
    {
        this.a = a;
        this.b = b;
        this.c = c;
        this.expo1 = expo1;
        this.expo2 = expo2;
        this.expo3 = expo3;
        this.abs = abs;
    }

    retrieveValue(x)
    {
        return Number(Math.pow(this.a * x, this.expo1) + Math.pow(this.b * x, this.expo2) + Math.pow(this.c * x, this.expo3) + this.abs);
    }
}


export class hirable
{
    constructor(name, description, rarity, refreshRate, func, minBoost = 0, maxBoost = 0, funcType = "Linear")
    {
        this.name = name;
        this.description = description;
        this.rarity = rarity;
        this.refreshRate = refreshRate;
        this.func = func;
        this.interval = null;
        this.currentBoost = 0;
        this.minBoost = minBoost;
        this.maxBoost = maxBoost;
        this.funcType = funcType;
    }

    refreshBoost()
    {
        this.currentBoost = this.func.retrieveValue(Math.random());
    }

    activate()
    {
        this.refreshBoost();
        this.interval = setInterval(() => this.refreshBoost(), this.refreshRate);
    }

    deactivate()
    {
        clearInterval(this.interval);
    }
}