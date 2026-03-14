            import { UIManager, camera} from "./dom.js";
            import { canvasButton, canvasButtonTexture, canvasPannel, canvasPannelTexture, techtreeUpgrade, particleEmitter, particle} from "./RetlawsCoolCanvasControls.js";


            document.addEventListener("mousemove", updateCursorPosition);
            document.addEventListener("DOMContentLoaded", () => 
            {
                startGame();
            });



            const backgroundDetail = 92;
            const WORLD_WIDTH = 10000;
            const TECHTREE_WIDTH = 1000;
            const MACHINE_START_POSITION = 200 // position of first machine
            const MACHINE_GAP = 1100; // space between machines
            const VIEW_WIDTH = canvas.width;
            const CIGARETTESPANELOFFSET = -300;
            
            
            var audio = new Audio('Audio/Monotone_Labor.mp3');
            
            
            
            let direction = 1;        // 1 = right, -1 = left
            let range = 20;           // max displacement in pixels
            let baseOffset = 0;
            let startScreenFadingIterator = 0;
            let preGameLoadupIterator = 250;

            var techtreeMap = {};
            
            
            let lastTime = performance.now();
            

            var techtreePanelOffsetX = 0;
            var techtreePanelOffsetY = 0;
            
            let lastX = 0;
            let lastY = 0;
            
            let velocityX = 0;    
            let velocityY = 0;    

            let startScreenAnimationIterator = 0;
            let draggingTolerance = 5;
            
            let isDragging = false;
            let clientClick = false;
            let uiBlockingInput = false;

            let resizingPanel = false;
            const resizeHandleSize = 35;

            let draggingPanel = false;
            let panelDragOffsetX = 0;
            let panelDragOffsetY = 0;

            let draggingWorld = false;

            var animatedCigarettes = [];
            var currentActiveParticleEmitter = [];
            
            // Game Variables
            var gameStarted = false;
            var frame = 0;
            
                // Set to 0 when Debug is Finished
            var cigarettes = 1000001;
            var upgradeCigarettes = 1000;
            var premiumCigarettes = 1000;
            
            const gameState = 
            {
                cigarettesGainMultiplier: 1
            };

            var cigarettesGain = 0;
            
            var machineBaseCosts = [10, 30, 100, 250, 1000, 5000, 20000, 100000, 500000, 10000000];
            var machineCostMultipliers = [0,1,1,1,1,1,1,1,1,1];
            var machineLevels = [0,0,0,0,0,0,0,0,0,0];


            //UI
            var upgradeButtons = [];
            var batchUpgradeButtons = [];
            var stackUpgradeButtons = [];
            var techtreeUpgrades = [];
            
            var techtreePannel;
            var techtreeButton;
            var startButton;
            var audioButton;
            var closeButton;
            
            var mousePosition;
            var cursorX;
            var cursorY;

            var ctx;


            

            // Textures
            const TextureButton = document.getElementById("Start");
            const TextureUpgrade = document.getElementById("Upgrade");
            const cigarettesTexture = document.getElementById("Cigarettes");
            const upgradeCigarettesTexture = document.getElementById("UpgradeCigarettes");
            const premiumCigarettesTexture = document.getElementById("PremiumCigarettes");
            const background = document.getElementById("Background");
            const cloudspattern = document.getElementById("Cloudpattern");
            const mountains = document.getElementById("Mountains");
            const valley = document.getElementById("Valley");
            const fabrik = document.getElementById("Fabrik");
            const bricks = document.getElementById("Bricks");
            const bricks_ = document.getElementById("Bricks_");
            const bricks__ = document.getElementById("Bricks__");
            const bricksAngled = document.getElementById("BricksAngled");
            const bricksAngledBordered = document.getElementById("BricksAngledBordered");
            const bricksGround = document.getElementById("BricksGround");
            const bricksGroundBordered = document.getElementById("BricksGroundBordered");
            const bricksTransition = document.getElementById("BricksTransition");


            // Animated Textures
            const BoxFrame1 = document.getElementById("Box_Frame1");
            const BoxFrame2 = document.getElementById("Box_Frame2");
            const BoxFrame3 = document.getElementById("Box_Frame3");

            const ConveyerFrame1 = document.getElementById("Conveyer_Frame1");
            const ConveyerFrame2 = document.getElementById("Conveyer_Frame2");
            const ConveyerFrame3 = document.getElementById("Conveyer_Frame3");
            const ConveyerFrame4 = document.getElementById("Conveyer_Frame4");

            const MachineFrame1 = document.getElementById("Machine_Frame1");
            const MachineFrame2 = document.getElementById("Machine_Frame2");
            const MachineFrame3 = document.getElementById("Machine_Frame3");
            const MachineFrame4 = document.getElementById("Machine_Frame4");
            const MachineFrame5 = document.getElementById("Machine_Frame5");
            const MachineFrame6 = document.getElementById("Machine_Frame6");
            const MachineFrame7 = document.getElementById("Machine_Frame7");




            class BackgroundLayer 
            {
                constructor(image, speed, offset = 0, isCloudPattern = false) 
                {
                    this.image = image;
                    this.speed = speed;
                    this.x = offset;
                    this.y = 0;
                    this.isCloudPattern = isCloudPattern;
                }

                update(direction, dt, preGameOffset) 
                {
                    this.x += direction * this.speed * dt;
                    this.y = Math.round(preGameOffset * this.speed * 4 / 4) * 4;
                }

                draw(ctx, canvas) 
                {
                    if(this.isCloudPattern)
                    {
                        ctx.drawImage(this.image,Math.round(this.x * 2),this.y,this.image.width,this.image.height);
                    }
                    else
                    {
                        ctx.drawImage(this.image,Math.round(this.x * 2),this.y,canvas.width * 1.08,canvas.height);
                    }
                }
            }


            const layers = [
                new BackgroundLayer(background, 0.01, -20),
                new BackgroundLayer(cloudspattern, -30, -20, true),
                new BackgroundLayer(mountains, 0.5, -20),
                new BackgroundLayer(valley, 1, -20),
                new BackgroundLayer(fabrik, 1.5, -45),
            ];



            
            camera.x = Math.max(0,Math.min(WORLD_WIDTH - VIEW_WIDTH, camera.x));


            async function fetchTechtree(file) 
            {
                try 
                {
                    const response = await fetch(file);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const data = await response.json();
                    
                    console.log(data);


                    for(let i = 0; i < data.Upgrades.length; i++)
                    {
                        let obj = new techtreeUpgrade(
                            data.Upgrades[i].Position[0],
                            data.Upgrades[i].Position[1],
                            data.Upgrades[i].Size[0], 
                            data.Upgrades[i].Size[1], 
                            new canvasButtonTexture("", "Green", data.Upgrades[i].Name),
                            data.Upgrades[i].Name,
                            data.Upgrades[i].Cost,
                            data.Upgrades[i].Condition,
                            true
                        );

                        // Store position relative to panel top-left
                        obj.localX = data.Upgrades[i].Position[0];
                        obj.localY = data.Upgrades[i].Position[1];

                        // Function to update absolute position when panel moves
                        obj.updateOffset = function(panelX, panelY, panelW, panelH) {
                            const centerX = panelX + panelW / 2;
                            const centerY = panelY + panelH / 2;

                            this.x = centerX + this.localX - this.sizeX / 2;
                            this.y = centerY + this.localY - this.sizeY / 2;
                        };

                        // Set initial position
                        obj.updateOffset(techtreePannel.x, techtreePannel.y);


                        obj.onClick = function()
                        {
                            if(upgradeCigarettes >= obj.cost)
                            {
                                upgradeCigarettes -= obj.cost;
                                applyUpgrade(data.Upgrades[i].Effects);
                            }
                                
                        }

                        techtreeUpgrades.push(obj);
                    }  

                    techtreeUpgrades.forEach(element => 
                    {
                        techtreePannel.addChild(element);
                    });

                    techtreePannel.setActive(false);
                } 
                catch (error) 
                {
                    console.error('Failed to load Techtree:', error);
                }
            }




            function inititialiseButtons()
            {

                //Assignment
                techtreeButton = new canvasButton(myGameArea.canvas.width / 2 - 150, 0, 200, 50, new canvasButtonTexture("", "Grey", "Techtree"), true);
                startButton = new canvasButton(myGameArea.canvas.width / 2 - 250, 100, 500, 250, new canvasButtonTexture(TextureButton), true);
                audioButton = new canvasButton(myGameArea.canvas.width - 60, myGameArea.canvas.height - 60, 50, 50, new canvasButtonTexture("", "Red", "🎵"), true);
                
                techtreePannel = new canvasPannel(50, 50, myGameArea.canvas.width - 100, myGameArea.canvas.height - 100, new canvasPannelTexture("", "rgba(240,240,240,0.85)"), true);

                closeButton = new canvasButton(techtreePannel.x + techtreePannel.sizeX - 35, techtreePannel.y + 5, 30, 30, new canvasButtonTexture("", "Red", "X"), true);
                techtreePannel.addChild(closeButton);
                
                //OnClick Functions
                techtreeButton.onClick = function() {
                    techtreePannel.setActive(true);
                };

                closeButton.onClick = function() {
                    techtreePannel.active = false;

                    draggingWorld = false;
                    draggingPanel = false;
                    resizingPanel = false;
                };
                                

            
                startButton.onClick = function()
                {
                    gameStarted = true;
                    startButton.active = false;
                    techtreeButton.setActive(true);
                }
                
                
                audioButton.onClick = function()
                {
                    console.log("Clicked Audio");
                    
                    if(!audio.paused)
                        {
                            audio.pause();
                            audioButton.Texture.color = "Red";
                        }
                    else
                        {
                            audio.play();
                            audioButton.Texture.color = "Green";
                            audio.volume = 0.2;
                        }
                }
                    
                    
                techtreeButton.setActive(false);
                techtreePannel.setActive(false);


                UIManager.add(startButton);
                UIManager.add(audioButton);
                UIManager.add(techtreePannel);
                UIManager.add(techtreeButton);

                


                
                // Button Array Loop
                for(let i = 0; i < 10; i++)
                {
                    const x = machineX(i);

                    upgradeButtons[i] = new canvasButton(x + 50, 400, 100, 100, new canvasButtonTexture(TextureUpgrade, "", "Free"), false);
                    batchUpgradeButtons[i] = new canvasButton(x + 50, 375, 50, 25, new canvasButtonTexture("", "Grey", "5x"), false);
                    stackUpgradeButtons[i] = new canvasButton(x + 100, 375, 50, 25, new canvasButtonTexture("", "Grey", "10x"), false);


                    upgradeButtons[i].onClick = function()
                    {
                        velocityX = 0; // stop sliding

                        if(cigarettes >= machineBaseCosts[i] * machineCostMultipliers[i])
                        {
                            // Super Cool Particle Test
                            currentActiveParticleEmitter.push(
                                new particleEmitter(
                                    upgradeButtons[i].x + upgradeButtons[i].sizeX / 2,      // XPOS
                                    upgradeButtons[i].y + upgradeButtons[i].sizeY / 2,      // YPOS
                                    2,                                                      // SIZE
                                    new canvasPannelTexture("", "Yellow"),                     // Texture/Color
                                    4,                                                      // PSPU (Particles Spawned Per Frame)
                                    1,                                                      // Min Velocity
                                    7,                                                     // Max Velocity
                                    12,                                                    // LifeTime Particle
                                    10,                                                     // LifeTime Emitter
                                    true,                                                   // Gravity = false
                                    0,                                                       // Pull = 0
                                    true,                                                    // Active = true
                                    false                                                   // Absoulte = false
                                )
                            );

                            UIManager.add(currentActiveParticleEmitter[currentActiveParticleEmitter.length-1]);


                            cigarettes -= machineBaseCosts[i] * machineCostMultipliers[i];
                            upgradeCigarettes += 1;

                            switch(i)
                            {
                                case 0:
                                    if(cigarettesGain == 0)
                                    {
                                        cigarettesGain += 0.01;
                                        machineCostMultipliers[i] += 1;
                                    }
                                    else
                                    {
                                        machineCostMultipliers[i] *= 1.1;
                                    }
                                    
                                    machineLevels[i]++;
                                    cigarettesGain += 0.006;
                                    break;
                                case 1:
                                    machineLevels[i]++;
                                    cigarettesGain += 0.03;
                                    machineCostMultipliers[i] *= 1.1;
                                    break;
                                case 2:
                                    machineLevels[i]++;
                                    cigarettesGain += 0.1;
                                    machineCostMultipliers[i] *= 1.1;
                                    break;
                                case 3:
                                    machineLevels[i]++;
                                    cigarettesGain += 0.25;
                                    machineCostMultipliers[i] *= 1.1;
                                    break;
                                case 4:
                                    machineLevels[i]++;
                                    cigarettesGain += 0.75;
                                    machineCostMultipliers[i] *= 1.1;
                                    break;
                                case 5:
                                    machineLevels[i]++;
                                    cigarettesGain += 1.5;
                                    machineCostMultipliers[i] *= 1.1;
                                    break;
                                case 6:
                                    machineLevels[i]++;
                                    cigarettesGain += 2.5;
                                    machineCostMultipliers[i] *= 1.1;
                                    break;
                                case 7:
                                    machineLevels[i]++;
                                    cigarettesGain += 4.0;
                                    machineCostMultipliers[i] *= 1.1;
                                    break;
                                case 8:
                                    machineLevels[i]++;
                                    cigarettesGain += 4.0;
                                    machineCostMultipliers[i] *= 1.1;
                                    break;
                                case 9:
                                    machineLevels[i]++;
                                    cigarettesGain += 10.0;
                                    machineCostMultipliers[i] *= 1.1;
                                    break;
                            }
                        }
                    }

                    
                    
                    batchUpgradeButtons[i].onClick = function()
                    {
                        let BatchCost = 0;

                        

                        for(let j = 0; j < 5; j++)
                        {
                            BatchCost += Math.ceil(machineBaseCosts[i] * (machineCostMultipliers[i] * Math.pow(1.1, j)));
                        }

                        if(cigarettes > BatchCost)
                        {
                            // Super Cool Particle Test
                            currentActiveParticleEmitter.push(
                                new particleEmitter(
                                    batchUpgradeButtons[i].x + batchUpgradeButtons[i].sizeX / 2,      // XPOS
                                    batchUpgradeButtons[i].y + batchUpgradeButtons[i].sizeY / 2,      // YPOS
                                    2,                                                      // SIZE
                                    new canvasPannelTexture("", "Lime"),                     // Texture/Color
                                    8,                                                      // PSPU (Particles Spawned Per Frame)
                                    1,                                                      // Min Velocity
                                    10,                                                     // Max Velocity
                                    10,                                                    // LifeTime Particle
                                    12,                                                     // LifeTime Emitter
                                    true,                                                   // Gravity = false
                                    0,                                                       // Pull = 0
                                    true,                                                    // Active = true
                                    false                                                   // Absoulte = false
                                )
                            );

                            UIManager.add(currentActiveParticleEmitter[currentActiveParticleEmitter.length-1]);



                            cigarettes -= BatchCost;
                            upgradeCigarettes += 5;
                            
                            

                            switch(i)
                            {
                                case 0:
                                    cigarettesGain += 0.006 * 5;
                                    machineLevels[i] += 5;
                                    machineCostMultipliers[i] *= Math.pow(1.1, 5);
                                    break;
                                case 1:
                                    cigarettesGain += 0.03 * 5;
                                    machineLevels[i] += 5;
                                    machineCostMultipliers[i] *= Math.pow(1.1, 5);
                                    break;
                                case 2:
                                    cigarettesGain += 0.1 * 5;
                                    machineLevels[i] += 5;
                                    machineCostMultipliers[i] *= Math.pow(1.1, 5);
                                    break;
                                case 3:
                                    cigarettesGain += 0.25 * 5;
                                    machineLevels[i] += 5;
                                    machineCostMultipliers[i] *= Math.pow(1.1, 5);
                                    break;
                                case 4:
                                    cigarettesGain += 0.75 * 5;
                                    machineLevels[i] += 5;
                                    machineCostMultipliers[i] *= Math.pow(1.1, 5);
                                    break;
                                case 5:
                                    cigarettesGain += 1.5 * 5;
                                    machineLevels[i] += 5;
                                    machineCostMultipliers[i] *= Math.pow(1.1, 5);
                                    break;
                                case 6:
                                    cigarettesGain += 2.5 * 5;
                                    machineLevels[i] += 5;
                                    machineCostMultipliers[i] *= Math.pow(1.1, 5);
                                    break;
                                case 7:
                                    cigarettesGain += 4.0 * 5;
                                    machineLevels[i] += 5;
                                    machineCostMultipliers[i] *= Math.pow(1.1, 5);
                                    break;
                                case 8:
                                    cigarettesGain += 4.0 * 5;
                                    machineLevels[i] += 5;
                                    machineCostMultipliers[i] *= Math.pow(1.1, 5);
                                    break;
                                case 9:
                                    cigarettesGain += 10.0 * 5;
                                    machineLevels[i] += 5;
                                    machineCostMultipliers[i] *= Math.pow(1.1, 5);
                                    break;
                            }
                        }
                    }

                    stackUpgradeButtons[i].onClick = function()
                    {
                        // Super Cool Particle Test
                            currentActiveParticleEmitter.push(
                                new particleEmitter(
                                    stackUpgradeButtons[i].x + stackUpgradeButtons[i].sizeX / 2,      // XPOS
                                    stackUpgradeButtons[i].y + stackUpgradeButtons[i].sizeY / 2,      // YPOS
                                    2,                                                      // SIZE
                                    new canvasPannelTexture("", "Cyan"),                     // Texture/Color
                                    15,                                                      // PSPU (Particles Spawned Per Frame)
                                    1,                                                      // Min Velocity
                                    17,                                                     // Max Velocity
                                    10,                                                    // LifeTime Particle
                                    10,                                                     // LifeTime Emitter
                                    true,                                                   // Gravity = false
                                    0,                                                       // Pull = 0
                                    true,                                                    // Active = true
                                    false                                                   // Absolute = false
                                )
                            );

                            UIManager.add(currentActiveParticleEmitter[currentActiveParticleEmitter.length-1]);


                        let StackCost = 0;

                        for(let j = 0; j < 10; j++)
                        {
                            StackCost += Math.ceil(machineBaseCosts[i] * (machineCostMultipliers[i] * Math.pow(1.1, j)));
                        }

                        if(cigarettes > StackCost)
                        {
                            cigarettes -= StackCost;
                            upgradeCigarettes += 10;

                            switch(i)
                            {
                                case 0:
                                    cigarettesGain += 0.006 * 10;
                                    machineLevels[i] += 10;
                                    machineCostMultipliers[i] *= Math.pow(1.1, 10);
                                    break;
                                case 1:
                                    cigarettesGain += 0.03 * 10;
                                    machineLevels[i] += 10;
                                    machineCostMultipliers[i] *= Math.pow(1.1, 10);
                                    break;
                                case 2:
                                    cigarettesGain += 0.1 * 10;
                                    machineLevels[i] += 10;
                                    machineCostMultipliers[i] *= Math.pow(1.1, 10);
                                    break;
                                case 3:
                                    cigarettesGain += 0.25 * 10;
                                    machineLevels[i] += 10;
                                    machineCostMultipliers[i] *= Math.pow(1.1, 10);
                                    break;
                                case 4:
                                    cigarettesGain += 0.75 * 10;
                                    machineLevels[i] += 10;
                                    machineCostMultipliers[i] *= Math.pow(1.1, 10);
                                    break;
                                case 5:
                                    cigarettesGain += 1.5 * 10;
                                    machineLevels[i] += 10;
                                    machineCostMultipliers[i] *= Math.pow(1.1, 10);
                                    break;
                                case 6:
                                    cigarettesGain += 2.5 * 10;
                                    machineLevels[i] += 10;
                                    machineCostMultipliers[i] *= Math.pow(1.1, 10);
                                    break;
                                case 7:
                                    cigarettesGain += 4.0 * 10;
                                    machineLevels[i] += 10;
                                    machineCostMultipliers[i] *= Math.pow(1.1, 10);
                                    break;
                                case 8:
                                    cigarettesGain += 4.0 * 10;
                                    machineLevels[i] += 10;
                                    machineCostMultipliers[i] *= Math.pow(1.1, 10);
                                    break;
                                case 9:
                                    cigarettesGain += 10.0 * 10;
                                    machineLevels[i] += 10;
                                    machineCostMultipliers[i] *= Math.pow(1.1, 10);
                                    break;
                            }
                        }
                    }

                    UIManager.add(upgradeButtons[i]);
                    UIManager.add(batchUpgradeButtons[i]);
                    UIManager.add(stackUpgradeButtons[i]);

                }
            }




            // (Setup Loop)
            async function startGame() 
            {
                myGameArea.start();

                inititialiseButtons();

                await fetchTechtree('Techtree.json');

                techtreeUpgrades.forEach(element => {
                    techtreePannel.addChild(element);
                });
            }




            function addListenersToCanvas(canvas)
            {

                canvas.addEventListener("pointerdown", e => {

                const mx = e.clientX;
                const my = e.clientY;

                if(techtreePannel.active)
                {
                    // resize
                    if(overResizeHandle(mx,my))
                    {
                        resizingPanel = true;
                        return;
                    }

                    // drag panel
                    if(techtreePannel.containsPoint(mx,my))
                    {
                        draggingPanel = true;
                        panelDragOffsetX = mx - techtreePannel.x;
                        panelDragOffsetY = my - techtreePannel.y;
                        return;
                    }

                    // buttons inside panel
                    if(UIManager.handleClick(mx,my))
                        return;
                }

                // world input
                draggingWorld = true;
                lastX = e.clientX;
                clientClick = true;
            });
                
                canvas.addEventListener("pointermove", e =>
                {
                    const mx = e.clientX;
                    const my = e.clientY;

                    if(draggingPanel)
                    {
                        techtreePannel.x = mx - panelDragOffsetX;
                        techtreePannel.y = my - panelDragOffsetY;

                        techtreeUpgrades.forEach(el => el.updateOffset(techtreePannel.x, techtreePannel.y, techtreePannel.sizeX, techtreePannel.sizeY));

                        return;
                    }

                    if(resizingPanel)
                    {
                        techtreePannel.sizeX = mx - techtreePannel.x;
                        techtreePannel.sizeY = my - techtreePannel.y;
                        return;
                    }

                    // World drag
                    if(!techtreePannel.active && draggingWorld)
                    {
                        camera.x -= (mx - lastX);
                        lastX = mx;
                    }
                });
                

                canvas.addEventListener("pointerup", e => 
                {
                    draggingPanel = false;
                    resizingPanel = false;
                    draggingWorld = false;
                });


                canvas.addEventListener("click", function(e)
                {
                    const rect = canvas.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;

                    UIManager.handleClick(mouseX, mouseY);
                });
            }




            function addListenersToWindow()
            {
                window.addEventListener('keydown', function (e) 
                {
                    if (e.key === "ArrowDown") 
                    {
                            console.log("pressed");
                    } 
                });
                    
                window.addEventListener('resize', function() 
                {
                    document.getElementById("canvas").width = window.innerWidth - 0;
                    document.getElementById("canvas").height = window.innerHeight - 4;
                    realignGUI();
                });
            }



            var myGameArea = 
            {
                canvas : document.getElementById("canvas"),
                start : function() {
                    this.canvas.width = window.innerWidth - 0;
                    this.canvas.height = window.innerHeight - 4;
                    this.context = this.canvas.getContext("2d");
                    ctx = this.context;
                    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
                    this.frameNo = 0;
                    this.interval = setInterval(updateGameArea, 20);

                    addListenersToCanvas(this.canvas);
                    addListenersToWindow();

                },
                updateSize : function()
                {
                    
                },
                pause : function()
                {
                    clearInterval(this.interval);
                },
                unpause : function() 
                {
                    this.interval = setInterval(updateGameArea, 20);
                },
                stop : function() 
                {
                    clearInterval(this.interval);
                },    
                clear : function() 
                {
                    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                }
            }



            function update() 
            {
                if (!isDragging) 
                {
                    velocityX *= 0.92;
                    velocityY *= 0.92;

                    if(!techtreePannel.active)
                    {
                        velocityX = 0;
                    }
                }

                // Clamp
                camera.x = Math.max(0, Math.min(WORLD_WIDTH - VIEW_WIDTH, camera.x));
                techtreePanelOffsetX = Math.max(-TECHTREE_WIDTH + VIEW_WIDTH, Math.min(TECHTREE_WIDTH - VIEW_WIDTH, techtreePanelOffsetX));
                techtreePanelOffsetY = Math.max(0, Math.min(500, techtreePanelOffsetY));
                /* techtreeUpgrades.forEach(element => {
                    element.updateOffset([techtreePanelOffsetX, techtreePanelOffsetY])
                }); panel handles the positioning */

            }   
            



        function drawBackground(ctx)
        {
            for(let j = 0; j < (WORLD_WIDTH + myGameArea.canvas.width) / backgroundDetail; j++)
            {
                for(let i = 0; i < myGameArea.canvas.height / backgroundDetail; i++)
                {
                    if(i + 3 < myGameArea.canvas.height / backgroundDetail)
                    {
                        ctx.drawImage(bricks, backgroundDetail * j + j * -1, i * backgroundDetail + i * -1, backgroundDetail, backgroundDetail);
                    }
                    else if(i + 2 < myGameArea.canvas.height / backgroundDetail)
                    {
                        ctx.drawImage(bricksGroundBordered, backgroundDetail * j + j * -1, i * backgroundDetail + i * -1, backgroundDetail, backgroundDetail);
                    }
                    else
                    {
                        ctx.drawImage(bricksGround, backgroundDetail * j + j * -1, i * backgroundDetail + i * -1, backgroundDetail, backgroundDetail);
                    }
                }
            }
        }



        function realignGUI()
        {
            startButton.x = myGameArea.canvas.width / 2 - (myGameArea.canvas.width / 4 / 2);
            startButton.sizeX = myGameArea.canvas.width / 4;
            startButton.sizeY = myGameArea.canvas.height / 4;


            techtreeButton.x = myGameArea.canvas.width / 2 - 150;


            techtreePannel.sizeX = myGameArea.canvas.width - 100;
            techtreePannel.sizeY = myGameArea.canvas.height - 100;

            audioButton.x = myGameArea.canvas.width - 60;
            audioButton.y = myGameArea.canvas.height - 60;
        }
        




        // Update Loop
        function updateGameArea()
        {
            const now = performance.now();
            const dt = (now - lastTime) / 1000; // seconds
            
            frame++;

            if(techtreePannel.active && techtreePannel.containsPoint(cursorX, cursorY))
            {
                uiBlockingInput = true; // if mouse is over the panel, then block input to the world (buttons will still work)
            } 
            else
            {
                uiBlockingInput = false;
            }
  
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            closeButton.x = techtreePannel.x + techtreePannel.sizeX - 35;
            closeButton.y = techtreePannel.y + 5;

            // Intro Sequence
            if(!gameStarted)
            {
                lastTime = now;
                baseOffset += direction * dt;
                
                
                if (Math.abs(baseOffset) > range) 
                {
                    direction *= -1;
                }
                

                
                if(preGameLoadupIterator > 0 && preGameLoadupIterator < 150)
                {
                    preGameLoadupIterator--;
                    layers.forEach(layer => layer.update(direction, dt, preGameLoadupIterator));
                    layers.forEach(layer => layer.draw(ctx, myGameArea.canvas));
                }
                else if(preGameLoadupIterator < 150)
                {
                    startScreenFadingIterator++;
                    layers.forEach(layer => layer.update(direction, dt, preGameLoadupIterator));
                    layers.forEach(layer => layer.draw(ctx, myGameArea.canvas));
                    drawStartButton();
                    UIManager.draw(ctx, true);
                }
                else
                {
                    layers.forEach(layer => layer.update(direction, dt, 150));
                    layers.forEach(layer => layer.draw(ctx, myGameArea.canvas));
                    preGameLoadupIterator--;
                }
                


                startScreenAnimationIterator++;
                clientClick = false;
                return;
            }
            


            update();

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(-camera.x, -camera.y);


            cigarettes += cigarettesGain * gameState["cigarettesGainMultiplier"];




            // Relative to Camera //
            drawBackground(ctx);
            drawButtonsAndLabels();

            
            // Camera Elements Only
            UIManager.draw(ctx, false);

            for(let i = 0; i < machineLevels.length; i++)
            {
                if(machineLevels[i] > 0)
                {

                    const machineAnimationSpeed = 150;

                    

                    if(frame % machineAnimationSpeed > Math.round(machineAnimationSpeed / 17) * 6)
                    {
                        ctx.drawImage(MachineFrame1, machineX(i), 512, 256, 512);
                    }
                    else if(frame % machineAnimationSpeed > Math.round(machineAnimationSpeed / 17) * 5)
                    {
                        ctx.drawImage(MachineFrame7, machineX(i), 500, 256, 512);
                    }
                    else if(frame % machineAnimationSpeed > Math.round(machineAnimationSpeed / 17) * 4)
                    {
                        ctx.drawImage(MachineFrame6, machineX(i), 500, 256, 512);
                    }
                    else if(frame % machineAnimationSpeed > Math.round(machineAnimationSpeed / 17) * 3)
                    {
                        ctx.drawImage(MachineFrame5, machineX(i), 500, 256, 512);
                    }
                    else if(frame % machineAnimationSpeed > Math.round(machineAnimationSpeed / 17) * 2)
                    {
                        ctx.drawImage(MachineFrame4, machineX(i), 500, 256, 512);
                    }
                    else if(frame % machineAnimationSpeed > Math.round(machineAnimationSpeed / 17))
                    {
                        ctx.drawImage(MachineFrame3, machineX(i), 500, 256, 512);
                    }
                    else if(frame % machineAnimationSpeed >= 0)
                    {
                        ctx.drawImage(MachineFrame2, machineX(i), 500, 256, 512);
                    }


                    const conveyerAnimationSpeed = 50;


                    if(frame % (conveyerAnimationSpeed * 10) == 0)
                    {
                        animatedCigarettes.push([machineX(i) + 190, 760 + 256 / 2 - 50, 0]);
                    }


                    if(frame % conveyerAnimationSpeed > Math.round(conveyerAnimationSpeed / 4) * 3)
                    {
                        ctx.drawImage(ConveyerFrame4, 390 + 1100 * i, 760, 512, 256);
                    }
                    else if(frame % conveyerAnimationSpeed > Math.round(conveyerAnimationSpeed / 4) * 2)
                    {
                        ctx.drawImage(ConveyerFrame3, 390 + 1100 * i, 760, 512, 256);
                    }
                    else if(frame % conveyerAnimationSpeed > Math.round(conveyerAnimationSpeed / 4))
                    {
                        ctx.drawImage(ConveyerFrame2, 390 + 1100 * i, 760, 512, 256);
                    }
                    else if(frame % conveyerAnimationSpeed >= 0)
                    {
                        ctx.drawImage(ConveyerFrame1, 390 + 1100 * i, 760, 512, 256);
                    }

                    ctx.drawImage(BoxFrame1, machineX(i) + 535, 830, 256, 256);
                }
            }


            animatedCigarettes.forEach(element => {
                if(frame % Math.round(50 / 4) == 0)
                    {
                        element[0] += 4;
                    }
                element[2]++; // Lifetime
                if(element[2] > 1250)
                {
                    element[1] += 1;
                }
                if(element[2] > 1300)
                {
                    animatedCigarettes.splice(animatedCigarettes.indexOf(element), 1);
                }
                ctx.drawImage(cigarettesTexture, element[0], element[1], 64, 64);
                });

                

            
            for(let i = currentActiveParticleEmitter.length - 1; i >= 0; i--) // so particles appear correctly
            {
                if(currentActiveParticleEmitter[i].emitterlifetime > 0)
                {
                    currentActiveParticleEmitter[i].spawnParticle();
                }
                else if(currentActiveParticleEmitter[i].particleChildren.length == 0)
                {
                    currentActiveParticleEmitter.splice(i, 1);
                }
            }




            ctx.restore();

            // Relative to Screen //
            UIManager.draw(ctx, true);

            if(techtreePannel.active)
            {
                techtreeUpgrades.forEach(element => {
                    element.drawConnections(ctx, techtreeUpgrades);
                });
            }

        



            // Debug Info
            ctx.textAlign = "left";
            ctx.textBaseline = "middle"; // center aint a valid value here...lovely javascript
            ctx.font = "20px Arial";
            ctx.strokeStyle = "Black";
            ctx.fillStyle = "Black";
            ctx.fillText("Frame: " + frame, 20, 20);
            ctx.fillText(mousePosition, 20, 50);
            ctx.fillText("TechtreeOffset X: " + techtreePanelOffsetX + ", Y: " + techtreePanelOffsetY, 20, 80);
            ctx.fillText("Current Active Emitter: " + currentActiveParticleEmitter.length, 20, 110);

            let particleAmount = 0;
            currentActiveParticleEmitter.forEach(element => {
                element.particleChildren.forEach(e => {
                    particleAmount++;
                });
            });

            ctx.fillText("Particle Amount: " + particleAmount, 20, 140);



            drawCurrencyPanel();
            
            if (techtreePannel.active)
            {
                updateUpgradeButtons();

                techtreeUpgrades.forEach(el =>
                    el.updateOffset(
                        techtreePannel.x,
                        techtreePannel.y,
                        techtreePannel.sizeX,
                        techtreePannel.sizeY
                    ),

                    ctx.fillRect(
                        techtreePannel.x + techtreePannel.sizeX - 20, 
                        techtreePannel.y + techtreePannel.sizeY - 20,
                        20,
                        20
                    )
                );
            }

            
            clientClick = false;
        }


        function updateUpgradeButtons()
        {
            for(let i = 0; i < upgradeButtons.length; i++)
            {
                if(cigarettes >  Math.ceil(machineBaseCosts[i] * machineCostMultipliers[i]) || upgradeButtons[i].Texture.text == "Free")
                {
                    upgradeButtons[i].setAlpha(0.95);
                }
                else
                {
                    upgradeButtons[i].setAlpha(0.6);
                }

                let BatchCost = 0;

                for(let j = 0; j < 5; j++)
                {
                    BatchCost += Math.ceil(machineBaseCosts[i] * (machineCostMultipliers[i] * Math.pow(1.1, j)));
                }

                if(cigarettes > BatchCost)
                {
                    batchUpgradeButtons[i].Texture.color = "green";
                }
                else
                {
                    batchUpgradeButtons[i].Texture.color = "grey";
                }

                for(let j = 5; j < 10; j++)
                {
                    BatchCost += Math.ceil(machineBaseCosts[i] * (machineCostMultipliers[i] * Math.pow(1.1, j)));
                }

                if(cigarettes > BatchCost)
                {
                    stackUpgradeButtons[i].Texture.color = "green";
                }
                else
                {
                    stackUpgradeButtons[i].Texture.color = "grey";
                }

            }
        }


        function drawStartButton()
        {
            //Start-Button
            const FadeTiming = 100;
            const MoveTiming = 40;
            

            if(startScreenAnimationIterator % (MoveTiming * 2) < MoveTiming)
                {
                    if(startScreenAnimationIterator % (MoveTiming / 4) == 0)
                    {
                        startButton.y -= 1;
                    }
                }
                else
                {
                    if(startScreenAnimationIterator % (MoveTiming / 4) == 0)
                    {
                        startButton.y += 1;
                    }
                }

            if(!startButton.onClickCheck(cursorX, cursorY, clientClick))
            {

                if(startScreenFadingIterator % (FadeTiming * 2) < FadeTiming)
                {
                    startButton.setAlpha((startScreenFadingIterator % FadeTiming) / FadeTiming + 0.3)
                }
                else
                {
                    startButton.setAlpha(1 - (startScreenFadingIterator % FadeTiming) / FadeTiming + 0.3);
                }
            }
            else
            {
                startButton.setAlpha(1);
                startScreenFadingIterator = FadeTiming;
            }
        }


        function drawCurrencyPanel()
        {
             ctx.fillStyle = "rgba(255,255,255,0.33)";
            ctx.fillRect(canvas.width + CIGARETTESPANELOFFSET + 75, 0, 175, 200);

            ctx.drawImage(cigarettesTexture, canvas.width + CIGARETTESPANELOFFSET + 200, 5, 50, 50);
            ctx.drawImage(upgradeCigarettesTexture, canvas.width + CIGARETTESPANELOFFSET + 200, 65, 50, 50);
            ctx.drawImage(premiumCigarettesTexture, canvas.width + CIGARETTESPANELOFFSET + 200, 125, 50, 50);
            ctx.fillStyle = "rgba(0,0,0,1)";
            ctx.font = "28px Titanic";


            switch (true) 
            {
                case cigarettes > 1000000000:
                    ctx.fillText((cigarettes / 1000000000).toFixed(2) + "Trl", canvas.width + CIGARETTESPANELOFFSET + 80, 42);
                    break;
                case cigarettes > 1000000000:
                    ctx.fillText((cigarettes / 1000000).toFixed(2) + "Bil", canvas.width + CIGARETTESPANELOFFSET + 80, 42);
                    break;
                case cigarettes > 1000000:
                    ctx.fillText((cigarettes / 1000000).toFixed(2) + "Mil", canvas.width + CIGARETTESPANELOFFSET + 80, 42);
                    break;
                case cigarettes > 1000:
                    ctx.fillText((cigarettes / 1000).toFixed(2) + "Tsd", canvas.width + CIGARETTESPANELOFFSET + 80, 42);
                    break;
                default:
                    ctx.fillText(Math.floor(cigarettes), canvas.width + CIGARETTESPANELOFFSET + 80, 42);
                    break;
            }
           
            ctx.fillText(upgradeCigarettes, canvas.width + CIGARETTESPANELOFFSET + 80, 102);
            ctx.fillText(premiumCigarettes, canvas.width + CIGARETTESPANELOFFSET + 80, 162);
        }




        function drawButtonsAndLabels()
        {
            for(let i = 0; i < upgradeButtons.length; i++)
            {
                const val = Math.ceil(machineBaseCosts[i] * machineCostMultipliers[i]);

                switch(true)
                {
                    case val >= 1000000:
                        upgradeButtons[i].Texture.text = (val / 1000000).toFixed(2).toString() + "Mil";
                        break;
                    case val >= 1000:
                        upgradeButtons[i].Texture.text = (val / 1000).toFixed(2).toString() + "Tsd";
                        break;
                    default:
                        upgradeButtons[i].Texture.text = (val).toString()
                        break;
                }

                if(upgradeButtons[i].Texture.text == 0)
                {
                    upgradeButtons[i].Texture.text = "Free";
                }
            }
        }



            function updateCursorPosition(event) 
            {
                cursorX = event.clientX;
                cursorY = event.clientY;
                var positionElement = document.getElementById("mousePosition");

                // Update the body's content to display the cursor position
                mousePosition = "X: " + Math.round(cursorX - 8 + camera.x) + ", Y: " + Math.round(cursorY - 8 + camera.y);
            }



        function applyUpgrade(upgrade) {

            upgrade.forEach(effect => {

                const target = effect.target;

                switch (effect.operation) {

                    case "add":
                        gameState[target] += effect.value;
                        break;

                    case "multiply":
                        gameState[target] *= effect.value;
                        break;

                    case "set":
                        gameState[target] = effect.value;
                        break;
                }
            });
        }

        function machineX(i) {
            return MACHINE_START_POSITION + MACHINE_GAP * i;
        }

        function overResizeHandle(mx, my) {
            return (
                mx > techtreePannel.x + techtreePannel.sizeX - resizeHandleSize &&
                my > techtreePannel.y + techtreePannel.sizeY - resizeHandleSize
            )
        }
