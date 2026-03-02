

// UI Manager for all UI-Elements
export const UIManager = 
            {
                elements: [],
                
                add(element) 
                {
                    this.elements.push(element);
                },

                handleClick(mouseX, mouseY) 
                {
                    console.log("Click at: " + mouseX + ", " + mouseY);
                    
                    // Iterate in reverse draw order (topmost first)
                    for (let i = this.elements.length - 1; i >= 0; i--) 
                    {
                        const element = this.elements[i];

                        
                        if (element.hitTest(mouseX, mouseY)) 
                        {
                            console.log("true");

                            if (element.blocksInput) 
                            {
                                element.onClick();
                                return;
                            }
                        }
                    }
                },

                draw(absolute) 
                {
                    if(absolute)
                    {
                        this.elements.forEach(element => 
                        {
                            if(element.isAbsolute)
                            {
                                element.drawSelf();
                            }
                        });
                    }
                    else
                    {
                        this.elements.forEach(element => 
                        {
                            if(!element.isAbsolute)
                            {
                                element.drawSelf();
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



            

