
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
                    console.log(this.currentScene);
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