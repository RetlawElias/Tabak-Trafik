            import { UIManager, camera, SceneManager} from "./dom.js";
            import { canvasButton, canvasButtonTexture, canvasPannel, canvasPannelTexture, techtreeUpgrade, 
                     particleEmitter, particle, inBoundChecker, techtreeUpgradeToolTip, canvasLabel, pulseEmitter, 
                     pulse, canvasAnimation, canvasTextfield } from "./RetlawsCoolCanvasControls.js";
            import { loadFrames } from "./animationMaster.js";
            


            document.addEventListener("mousemove", updateCursorPosition);
            document.addEventListener("DOMContentLoaded", () => 
            {
                startGame();
                realignGUI();
                //setInterval(checkAchievementsCollection(), 1000);
            });



            const backgroundDetail = 92;
            const WORLD_WIDTH = 10000;
            const TECHTREE_WIDTH = 1000;
            const MACHINE_START_POSITION = 200 // position of first machine
            const MACHINE_GAP = 1100; // space between machines
            const VIEW_WIDTH = canvas.width;
            const CIGARETTESPANELOFFSET = -300;
            
            
            // Wheel of fortune prizes 
            const segments = [
                "100 Cigarettes",
                "50 Cigarettes",
                "Nothing",
                "200 Cigarettes",
                "Spin Again",
                "150 Cigarettes",
                "JACKPOT",
                "75 Cigarettes"
            ];

            const colors = [
                "#f94144",
                "#f3722c",
                "#f9c74f",
                "#90be6d",
                "#43aa8b",
                "#577590",
                "#277da1",
                "#9b5de5"
            ];

            
            const nameAttributeDatabase = [
                "Productive",
                "Rapid",
                "Efficient",
                "Clean",
                "Super",
                "Awesome",
                "Competitive",
            ];

            const nameThemeDatabase = [
                "Cigarette",
                "Cigar",
                "Shag",
                "Snuff",
                "Smoke",
                "Nicotine",
                "Drug",
                "Ciggy",
                "Tobacco"
            ];

            const nameOperationDatabase = [
                "Business",
                "Cooperation",
                "Factory",
                "Company",
                "Productions",
                "Creator",
                "Maker",
                "Competitor"
            ];



            const slice = (Math.PI*2)/segments.length;

            let prizeClaimed = true;
            let WOFrotation = 0;
            let WOFvelocity = 0;
            let WOFspinning = false;

            const smokinAnimationFrames = loadFrames("Textures/SmokinAnimation", 152, 2);
            const trumpAnimationFrames = loadFrames("Textures/WinningAnimation", 138, 4);

            let trumpAnimation;
            let smokinAnimation;

            var partyInterval;

            var audio = new Audio('Audio/Westward.wav');
            var jackpot = new Audio('Audio/winning.mp3');
            var Unbuyable = new Audio('Audio/Unbuyable.wav');
            var Win = new Audio('Audio/Jackpot.wav');
            var Buy = new Audio('Audio/Collect.wav');
            var Collect = new Audio('Audio/DingDong.wav');
            var Chirp = new Audio('Audio/Chirp.wav')



            const EScenes = Object.freeze(
                { 
                    INTRO: "0", 
                    FACTORY: "1", 
                    OFFICE: "2"
                }
            );
            
            let currentActiveScene = EScenes.INTRO;


            const introSceneUI = new UIManager();
            const factorySceneUI = new UIManager();
            const officeSceneUI = new UIManager();

            const globalUI = new UIManager();


            let selectedTextfield = null;

            var allowAudio = false;
            var allowMusic = false;

            let direction = 1;        // 1 = right, -1 = left
            let range = 20;           // max displacement in pixels
            let baseOffset = 0;
            let startScreenFadingIterator = 0;
            let preGameLoadupIterator = 250;
            
            
            let lastTime = performance.now();
            
            let offsettingPanel = false;

            var techtreePanelOffsetX = 0;
            var techtreePanelOffsetY = 0;
            
            let lastX = 0;
            let lastY = 0;
            
            let velocityX = 0;    
            let velocityY = 0;    

            let startScreenAnimationIterator = 0;
            
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

            var gameName = "";
            var gameStarted = false;
            var frame = 0;
            
                // Set to 0 when Debug is Finished
            var cigarettes = 0;
            var upgradeCigarettes = 0;
            var premiumCigarettes = 0;
            
            const gameState = 
            {
                cigarettesGainMultiplier: 1,
                generalCostReduction: 1
            };

            var cigarettesGain = 0;
            
            var machineBaseCosts = [10, 30, 100, 250, 1000, 5000, 20000, 100000, 500000, 10000000];
            var machineCostMultipliers = [0,1,1,1,1,1,1,1,1,1];
            var machineLevels = [0,0,0,0,0,0,0,0,0,0];

            var hiringCosts = [10, 25, 50, 100, 200];

            //UI
            var upgradeButtons = [];
            var hiringButtons = [];
            var batchUpgradeButtons = [];
            var stackUpgradeButtons = [];
            var techtreeUpgrades = [];
            
            var techtreePannel;
            var namePanel;
            var WOFpanel;

            var achievementPanel;
            var achievementCollection;
            
            var techtreeButton;
            var startButton;
            var audioButton;
            var soundButton;
            var achievementButton;
            var closeButton;
            var closeAchievementsButton;
            var claimButton;
            var WOFbutton;
            
            var nameLabel;
            var prizeLabel;
            
            var nameTextfield;

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



            // Animationdata
            var machineFrameCollection = [MachineFrame1, MachineFrame2, MachineFrame3, MachineFrame4, MachineFrame5, MachineFrame6, MachineFrame7];
            var converyerFrameCollection = [ConveyerFrame1, ConveyerFrame2, ConveyerFrame3, ConveyerFrame4];
            var boxFrameCollection = [BoxFrame1];




            //Debug
            var frameIncrements = 1;
            var updateIntervals = 20;
            var debug = false;
            




            class BackgroundLayer 
            {
                constructor(name, image, speed, offset = 0, isCloudPattern = false) 
                {
                    this.image = image;
                    this.speed = speed;
                    this.x = offset;
                    this.y = 0;
                    this.isCloudPattern = isCloudPattern;
                    this.name = name;
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
                new BackgroundLayer("Background", background, 0.01, -20),
                new BackgroundLayer("Cloudpattern", cloudspattern, -30, -20, true),
                new BackgroundLayer("Mountains", mountains, 0.5, -20),
                new BackgroundLayer("Valley", valley, 1, -20),
                new BackgroundLayer("Factory", fabrik, 1.5, -45),
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

                        obj.localX = data.Upgrades[i].Position[0];
                        obj.localY = data.Upgrades[i].Position[1];


                        obj.Tooltip = new techtreeUpgradeToolTip(obj.x, obj.y, 200, 400, new canvasButtonTexture("", "rgb(163, 163, 163)", ""), data.Upgrades[i].ToolTip, true, true);

                        obj.Tooltip.localX = obj.x + obj.sizeX + 25;
                        obj.Tooltip.localY = obj.y;

                        
                        obj.Tooltip.updateOffset = function(panelX, panelY, panelW, panelH) {
                            const centerX = panelX + panelW / 2;
                            const centerY = panelY + panelH / 2;

                            this.x = centerX + this.localX - this.sizeX / 2 + 50;
                            this.y = centerY + this.localY;
                        }



                        

                        // Function to update absolute position when panel moves
                        obj.updateOffset = function(panelX, panelY, panelW, panelH) {
                            const centerX = panelX + panelW / 2;
                            const centerY = panelY + panelH / 2;

                            this.x = centerX + this.localX - this.sizeX / 2;
                            this.y = centerY + this.localY - this.sizeY / 2;

                            obj.Tooltip.updateOffset(panelX, panelY, panelW, panelH);
                        };

                        // Set initial position
                        obj.updateOffset(techtreePannel.x, techtreePannel.y);


                        obj.onClick = function()
                        {
                            let isBuyable = true;
                            obj.condition.forEach(element => {
                                techtreeUpgrades.forEach(upgrad => {
                                    if(element == upgrad.name)
                                    {
                                        if(!upgrad.isBought)
                                        {
                                            console.log("Condition ist nicht gekauft!");
                                            isBuyable = false;
                                        }
                                        else
                                        {
                                            console.log("Condition ist gekauft!");
                                        }
                                    }
                                    }
                                );
                            });

                            if(upgradeCigarettes >= obj.cost && !obj.isBought && isBuyable)
                            {
                                upgradeCigarettes -= obj.cost;
                                const newAudio = new Audio('Audio/Collect.wav');
                                newAudio.play();
                                applyUpgrade(data.Upgrades[i].Effects);
                                obj.isBought = true;
                            }
                            else
                            {
                                if(allowAudio)
                                {
                                    Unbuyable.play();
                                }
                            }
                                
                        }

                        obj.hitTest = function(mouseX, mouseY, camera = null)
                        {
                            if(this.isAbsolute)
                            {
                                const result =
                                mouseX >= obj.x + techtreePanelOffsetX &&
                                mouseX <= obj.x + obj.sizeX  + techtreePanelOffsetX &&
                                mouseY >= obj.y + techtreePanelOffsetY &&
                                mouseY <= obj.y + obj.sizeY + techtreePanelOffsetY;
                                if(result)
                                {
                                    console.log("Clicked an Upgrade!");
                                }
                                return result;
                            }
                            else
                            {
                                const result =
                                mouseX + camera.x >= obj.x &&
                                mouseX + camera.x <= obj.x + obj.sizeX &&
                                mouseY >= obj.y &&
                                mouseY <= obj.y + obj.sizeY;
                                console.log("Clicked an Upgrade!");
                                return result;
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




            function initialiseUI()
            {

                //Assignment
                techtreeButton = new canvasButton(myGameArea.canvas.width / 2 - 400, 5, 200, 50, new canvasButtonTexture("", "Grey", "Techtree"), true);
                startButton = new canvasButton(myGameArea.canvas.width / 2 - 250, 100, 500, 250, new canvasButtonTexture(TextureButton), true);
                audioButton = new canvasButton(myGameArea.canvas.width - 60, myGameArea.canvas.height - 60, 50, 50, new canvasButtonTexture("", "Red", "🎵"), true);
                soundButton = new canvasButton(myGameArea.canvas.width - 60, myGameArea.canvas.height - 120, 50, 50, new canvasButtonTexture("", "Red", "🔊"), true);
                achievementButton = new canvasButton(myGameArea.canvas.width - 60, myGameArea.canvas.height - 180, 50, 50, new canvasButtonTexture("", "rgb(255,255,0)", "🏆"), true);
                claimButton = new canvasButton(myGameArea.canvas.width / 2 - 200, myGameArea.canvas.height - 300, 400, 200, new canvasButtonTexture("", "Yellow", "Claim!"), true, false);
                WOFbutton = new canvasButton(myGameArea.canvas.width / 2 + 200, 0, 200, 50, new canvasButtonTexture("", "Purple", "Wheel of Fortune"), true);



                nameTextfield = new canvasTextfield(myGameArea.canvas.width / 2 - 250, 400, 500, 200, new canvasButtonTexture("", "White", ""), true);
                nameTextfield.maxLength = 30;
                nameTextfield.onClick = function()
                {
                    nameTextfield.selected = true;
                    selectedTextfield = nameTextfield;
                    console.log("Selected a Textfield!");
                }

                namePanel = new canvasPannel(myGameArea.canvas.width / 2 - 140, 5, 280, 65, new canvasPannelTexture("", "White"), true, true);
                namePanel.alpha = 0.7;
                nameLabel = new canvasLabel(myGameArea.canvas.width / 2 - 140, 5, 280, 65, new canvasButtonTexture("", "Black", "Name"), true, true);
                nameLabel.zPosition = -2;


                
                
                
                achievementPanel = new canvasPannel(50, 50, myGameArea.canvas.width - 100, myGameArea.canvas.height - 100, new canvasPannelTexture("", "rgba(255, 253, 159, 0.85)"), true);
                closeAchievementsButton = new canvasButton(achievementPanel.x + achievementPanel.sizeX - 35, achievementPanel.y + 5, 30, 30, new canvasButtonTexture("", "Red", "X"), true);
                
                achievementPanel.addChild(closeAchievementsButton);


                techtreePannel = new canvasPannel(50, 50, myGameArea.canvas.width - 100, myGameArea.canvas.height - 100, new canvasPannelTexture("", "rgba(160, 226, 255, 0.85)"), true);
                closeButton = new canvasButton(techtreePannel.x + techtreePannel.sizeX - 35, techtreePannel.y + 5, 30, 30, new canvasButtonTexture("", "Red", "X"), true);
                WOFpanel = new canvasPannel(myGameArea.canvas.width / 2 - 500, 50, 1000, myGameArea.canvas.height - 100, new canvasPannelTexture("", "white"), true);
                WOFpanel.alpha = 0.8;
                

                techtreePannel.addChild(closeButton);
                

                prizeLabel = new canvasLabel(canvas.width / 2 - 150, 100, 300, 150, new canvasButtonTexture("", "", "Winnings"), true, true);
                
                trumpAnimation = new canvasAnimation(100, 100, 600, 800, trumpAnimationFrames, 1, true, true);
                smokinAnimation = new canvasAnimation(0, 0, 400, 400, smokinAnimationFrames, 1, true, true, false);

                trumpAnimation.zPosition = -2;

                trumpAnimation.setActive(false);
                smokinAnimation.setActive(false);



                //OnClick Functions#
                closeButton.onClick = function() 
                {
                    techtreePannel.active = false;

                    draggingWorld = false;
                    draggingPanel = false;
                    resizingPanel = false;
                };

                closeAchievementsButton.onClick = function()
                {
                    achievementPanel.setActive(false);
                }


                techtreeButton.onClick = function() 
                {
                    if(!achievementPanel.active)
                    {
                    if(allowAudio)
                    {
                        Chirp.play();
                    }
                    if(techtreePannel.active)
                    {
                        closeButton.onClick();
                    }
                    else
                    {
                        techtreePannel.setActive(true);
                    }
                    }
                };

                
                                

            
                startButton.onClick = function()
                {
                    if(nameTextfield.Texture.text == "" || nameTextfield.Texture.text == " ")
                    {
                        if(confirm("No name has been set for the factory... \nSelect a Random one?"))
                        {
                            gameName = 
                                nameAttributeDatabase[Math.floor(Math.random() * (nameAttributeDatabase.length - 1))] + " " +
                                nameThemeDatabase[Math.floor(Math.random() * (nameThemeDatabase.length - 1))] + " " +
                                nameOperationDatabase[Math.floor(Math.random() * (nameOperationDatabase.length-1) )];
                            console.log(gameName);
                            nameLabel.Texture.text = gameName;
                            gameStarted = true;
                            currentActiveScene = EScenes.FACTORY;
                            startButton.active = false;
                            techtreeButton.setActive(true);
                            WOFbutton.setActive(true);
                        }
                    }
                    else
                    {
                        gameName = nameTextfield.Texture.text;
                        nameLabel.Texture.text = gameName;
                        gameStarted = true;
                        currentActiveScene = EScenes.FACTORY;
                        startButton.active = false;
                        techtreeButton.setActive(true);
                        WOFbutton.setActive(true);
                    }
                }


                startButton.onClickCheck = function(cursorX, cursorY, clientClick)
                {
                    if(startButton.active)
                    {
                        if(cursorX >= startButton.x && cursorX <= startButton.x + startButton.sizeX &&
                           cursorY >= startButton.y && cursorY <= startButton.y + startButton.sizeY)
                        {
                            startButton.onHover(clientClick);
                            return true;
                        }
                
                        return false;
                    }
                }
                
                achievementButton.onClick = function()
                {
                    if(!techtreePannel.active)
                    {
                        if(achievementPanel.active)
                        {
                            achievementPanel.setActive(false);
                        }
                        else
                        {
                            achievementPanel.setActive(true);
                        }
                    }
                }


                WOFbutton.onClick = function()
                {
                    if (premiumCigarettes >= 50) {
                        premiumCigarettes -= 50;
                        spin(); 
                    }
                }
                
                audioButton.onClick = function()
                {
                    console.log("Clicked Audio");
                    
                    if(allowMusic)
                    {
                        allowMusic = false;
                        audioButton.Texture.color = "Red";
                        audio.pause();
                    }
                    else
                    {
                        allowMusic = true;
                        audioButton.Texture.color = "Green";
                    }
                }

                soundButton.onClick = function()
                {
                    console.log("Audio On");
                    if(allowAudio)
                    {
                        allowAudio = false;
                        soundButton.Texture.color = "Red";
                    }
                    else
                    {
                        allowAudio = true;
                        soundButton.Texture.color = "Green";
                    }
                }


                claimButton.onClick = function()
                {
                    prizeClaimed = true;
                    clearInterval(partyInterval);
                    WOFpanel.setActive(false);
                }
                    
                    
                techtreeButton.setActive(false);
                techtreePannel.setActive(false);
                achievementPanel.setActive(false);
                WOFbutton.setActive(false);

                //namePanel.addChild(nameLabel);

                WOFpanel.addChild(claimButton);
                WOFpanel.addChild(prizeLabel);
                WOFpanel.setActive(false);
                prizeLabel.setActive(false);

                introSceneUI.add(startButton);
                introSceneUI.add(nameTextfield);

                globalUI.add(WOFbutton);
                globalUI.add(techtreeButton);
                globalUI.add(audioButton);
                globalUI.add(soundButton);
                globalUI.add(achievementButton);
                globalUI.add(nameLabel);
                globalUI.add(namePanel);
                globalUI.add(techtreePannel);
                globalUI.add(achievementPanel);
                globalUI.add(WOFpanel);

                globalUI.add(trumpAnimation);
                globalUI.add(smokinAnimation);

                SceneManager.addScene(EScenes.INTRO, introSceneUI);
                SceneManager.addScene(EScenes.FACTORY, factorySceneUI);
                SceneManager.addScene(EScenes.OFFICE, officeSceneUI)

                SceneManager.setGlobalUI(globalUI);


                
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

                        if(cigarettes >= Math.ceil((machineBaseCosts[i] * machineCostMultipliers[i]) / gameState["generalCostReduction"]))
                        {
                            // Super Cool Particle Test
                            currentActiveParticleEmitter.push(
                                new particleEmitter(
                                    upgradeButtons[i].x + upgradeButtons[i].sizeX / 2 - camera.x,      // XPOS
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
                                    true                                                   // Absoulte = false
                                )
                            );

                            factorySceneUI.add(currentActiveParticleEmitter[currentActiveParticleEmitter.length-1]);

                            if(allowAudio)
                            {
                                const newAudio = new Audio('Audio/Collect.wav');
                                newAudio.play();
                            }

                            cigarettes -= Math.ceil((machineBaseCosts[i] * machineCostMultipliers[i]) / gameState["generalCostReduction"]);
                            upgradeCigarettes += 1;

                            switch(i)
                            {
                                case 0:
                                    if(machineLevels[i] == 0)
                                    {
                                        cigarettesGain += 0.01;
                                        machineCostMultipliers[i] += 1;
                                    }
                                    else
                                    {
                                        machineCostMultipliers[i] *= 1.1;
                                    }
                                    
                                    cigarettesGain += 0.006;
                                    break;
                                case 1:
                                    cigarettesGain += 0.03;
                                    break;
                                case 2:
                                    cigarettesGain += 0.1;
                                    break;
                                case 3:
                                    cigarettesGain += 0.25;
                                    break;
                                case 4:
                                    cigarettesGain += 0.75;
                                    break;
                                case 5:
                                    cigarettesGain += 1.5;
                                    break;
                                case 6:
                                    cigarettesGain += 2.5;
                                    break;
                                case 7:
                                    cigarettesGain += 4.0;
                                    break;
                                case 8:
                                    cigarettesGain += 4.0;
                                    break;
                                case 9:
                                    cigarettesGain += 10.0;
                                    break;
                            }

                            if(machineLevels[i] == 0)
                            {
                                currentActiveParticleEmitter.push(
                                    new pulseEmitter(
                                        machineX(i) + 250, 
                                        760,
                                        "White",
                                        1,
                                        30,
                                        18,
                                        15,
                                        true,
                                        false
                                    )
                                );

                                currentActiveParticleEmitter[currentActiveParticleEmitter.length-1].alpha = 0.02;
                                factorySceneUI.add(currentActiveParticleEmitter[currentActiveParticleEmitter.length-1]);

                                var boxAnimation = new canvasAnimation(machineX(i) + 535, 830, 256, 256, boxFrameCollection, 10, true, false, false);
                                boxAnimation.freezeFrame = BoxFrame1;
                                var conveyerAnimation = new canvasAnimation(machineX(i) + 200, 760, 512, 256, converyerFrameCollection, 10, true, false);
                                var machineAnimation = new canvasAnimation(machineX(i), 512, 256, 512, machineFrameCollection, 20, true, false);
                                var cigaretAnimation = new canvasAnimation(machineX(i));

                                factorySceneUI.add(machineAnimation);
                                factorySceneUI.add(conveyerAnimation);
                                factorySceneUI.add(boxAnimation);
                            }

                            machineCostMultipliers[i] *= 1.1;
                            machineLevels[i]++;
                        }
                        else
                        {
                            if(allowAudio)
                            {
                                Unbuyable.play();
                            }
                        }
                    }

                    
                    
                    batchUpgradeButtons[i].onClick = function()
                    {
                        let BatchCost = 0;

                        

                        for(let j = 0; j < 5; j++)
                        {
                            BatchCost += Math.ceil((machineBaseCosts[i] * (machineCostMultipliers[i] * Math.pow(1.1, j))) / gameState["generalCostReduction"]);
                        }

                        if(cigarettes > BatchCost)
                        {
                            // Super Cool Particle Test
                            currentActiveParticleEmitter.push(
                                new particleEmitter(
                                    batchUpgradeButtons[i].x + batchUpgradeButtons[i].sizeX / 2 - camera.x,      // XPOS
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
                                    true                                                   // Absoulte = false
                                )
                            );

                            factorySceneUI.add(currentActiveParticleEmitter[currentActiveParticleEmitter.length-1]);

                            if(allowAudio)
                            {
                                const newAudio = new Audio('Audio/Collect.wav');
                                newAudio.play();
                            }

                            cigarettes -= BatchCost;
                            upgradeCigarettes += 5;
                            
                            

                            switch(i)
                            {
                                case 0:
                                    cigarettesGain += 0.006 * 5;
                                    break;
                                case 1:
                                    cigarettesGain += 0.03 * 5;
                                    break;
                                case 2:
                                    cigarettesGain += 0.1 * 5;
                                    break;
                                case 3:
                                    cigarettesGain += 0.25 * 5;
                                    break;
                                case 4:
                                    cigarettesGain += 0.75 * 5;
                                    break;
                                case 5:
                                    cigarettesGain += 1.5 * 5;
                                    break;
                                case 6:
                                    cigarettesGain += 2.5 * 5;
                                    break;
                                case 7:
                                    cigarettesGain += 4.0 * 5;
                                    break;
                                case 8:
                                    cigarettesGain += 4.0 * 5;
                                    break;
                                case 9:
                                    cigarettesGain += 10.0 * 5;
                                    break;
                            }

                            if(machineLevels[i] == 0)
                            {
                                currentActiveParticleEmitter.push(
                                    new pulseEmitter(
                                        machineX(i) + 250, 
                                        760,
                                        "White",
                                        1,
                                        30,
                                        18,
                                        15,
                                        true,
                                        false
                                    )
                                );

                                currentActiveParticleEmitter[currentActiveParticleEmitter.length-1].alpha = 0.02;
                                factorySceneUI.add(currentActiveParticleEmitter[currentActiveParticleEmitter.length-1]);
                                    

                                var boxAnimation = new canvasAnimation(machineX(i) + 535, 830, 256, 256, boxFrameCollection, 10, true, false, false);
                                boxAnimation.freezeFrame = BoxFrame1;
                                var conveyerAnimation = new canvasAnimation(machineX(i) + 200, 760, 512, 256, converyerFrameCollection, 10, true, false);
                                var machineAnimation = new canvasAnimation(machineX(i), 512, 256, 512, machineFrameCollection, 20, true, false);

                                factorySceneUI.add(machineAnimation);
                                factorySceneUI.add(conveyerAnimation);
                                factorySceneUI.add(boxAnimation);
                            }

                            machineLevels[i] += 5;
                            machineCostMultipliers[i] *= Math.pow(1.1, 5);
                        }
                        else
                        {
                            if(allowAudio)
                            {
                                Unbuyable.play();
                            }
                        }
                    }

                    stackUpgradeButtons[i].onClick = function()
                    {
                    
                        let StackCost = 0;

                        for(let j = 0; j < 10; j++)
                        {
                            StackCost += Math.ceil((machineBaseCosts[i] * (machineCostMultipliers[i] * Math.pow(1.1, j))) / gameState["generalCostReduction"]);
                        }

                        if(cigarettes > StackCost)
                        {

                            // Super Cool Particle Test
                            currentActiveParticleEmitter.push(
                                new particleEmitter(
                                    stackUpgradeButtons[i].x + stackUpgradeButtons[i].sizeX / 2 - camera.x,      // XPOS
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
                                    true                                                   // Absolute = false
                                )
                            );

                            factorySceneUI.add(currentActiveParticleEmitter[currentActiveParticleEmitter.length-1]);

                            if(allowAudio)
                            {
                                const newAudio = new Audio('Audio/Collect.wav');
                                newAudio.play();
                            }

                            cigarettes -= StackCost;
                            upgradeCigarettes += 10;

                            switch(i)
                            {
                                case 0:
                                    cigarettesGain += 0.006 * 10;
                                    break;
                                case 1:
                                    cigarettesGain += 0.03 * 10;
                                    break;
                                case 2:
                                    cigarettesGain += 0.1 * 10;
                                    break;
                                case 3:
                                    cigarettesGain += 0.25 * 10;
                                    break;
                                case 4:
                                    cigarettesGain += 0.75 * 10;
                                    break;
                                case 5:
                                    cigarettesGain += 1.5 * 10;
                                    break;
                                case 6:
                                    cigarettesGain += 2.5 * 10;
                                    break;
                                case 7:
                                    cigarettesGain += 4.0 * 10;
                                    break;
                                case 8:
                                    cigarettesGain += 4.0 * 10;
                                    break;
                                case 9:
                                    cigarettesGain += 10.0 * 10;
                                    break;
                            }

                            if(machineLevels[i] == 0)
                            {
                                currentActiveParticleEmitter.push(
                                    new pulseEmitter(
                                        machineX(i) + 250, 
                                        760,
                                        "White",
                                        1,
                                        30,
                                        18,
                                        15,
                                        true,
                                        false
                                    )
                                );

                                currentActiveParticleEmitter[currentActiveParticleEmitter.length-1].alpha = 0.02;
                                factorySceneUI.add(currentActiveParticleEmitter[currentActiveParticleEmitter.length-1]);

                                var boxAnimation = new canvasAnimation(machineX(i) + 535, 830, 256, 256, boxFrameCollection, 10, true, false, false);
                                boxAnimation.freezeFrame = BoxFrame1;
                                var conveyerAnimation = new canvasAnimation(machineX(i) + 200, 760, 512, 256, converyerFrameCollection, 10, true, false);
                                var machineAnimation = new canvasAnimation(machineX(i), 512, 256, 512, machineFrameCollection, 20, true, false);
                                var cigaretAnimation = new canvasAnimation(machineX(i));

                                factorySceneUI.add(machineAnimation);
                                factorySceneUI.add(conveyerAnimation);
                                factorySceneUI.add(boxAnimation);
                            }

                            machineLevels[i] += 10;
                            machineCostMultipliers[i] *= Math.pow(1.1, 10);
                        }
                        else
                        {
                            if(allowAudio)
                            {
                                Unbuyable.play();
                            }
                        }
                    }

                    factorySceneUI.add(upgradeButtons[i]);
                    factorySceneUI.add(batchUpgradeButtons[i]);
                    factorySceneUI.add(stackUpgradeButtons[i]);
                }



                for(let i = 0; i < 4; i++)
                {
                    const x = machineX(i);
                    hiringButtons[i] = new canvasButton(x + 50, 400, 100, 100, new canvasButtonTexture(TextureUpgrade, "", hiringCosts[i].toString()), false);
                    officeSceneUI.add(hiringButtons[i]);
                }
            }




            // (Setup Loop)
            async function startGame() 
            {
                myGameArea.start();



                initialiseUI();

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

                if(techtreePannel.active && e.button === 0)
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

                   
                }

                if(techtreePannel.active && e.button === 1 && techtreePannel.containsPoint(mx,my))
                {
                    lastY = e.clientY;
                    lastX = e.clientX
                    

                    offsettingPanel = true;
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

                    if(offsettingPanel)
                    {
                        techtreePanelOffsetX -= lastX - e.clientX;
                        techtreePanelOffsetY -= lastY - e.clientY;
                        lastX = mx;
                        lastY = my;

                    }

                    // World drag
                    if(!techtreePannel.active && draggingWorld)
                    {
                        camera.x -= (mx - lastX);
                        lastX = mx;
                    }

                    const rect = canvas.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;
                });
                

                canvas.addEventListener("pointerup", e => 
                {
                    draggingPanel = false;
                    resizingPanel = false;
                    draggingWorld = false;
                    offsettingPanel = false;
                });


                canvas.addEventListener("click", function(e)
                {
                    if(selectedTextfield !== null)
                    {
                        selectedTextfield.selected = false;
                        selectedTextfield = null;
                    }

                    const rect = canvas.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;

                    SceneManager.handleClick(mouseX, mouseY);
                });
            }




            function addListenersToWindow()
            {
                //
                //  !!! DEBUG CHEATS !!!
                //

            





                window.addEventListener('keydown', function (e) 
                {
                    if(selectedTextfield !== null)
                    {
                        if(selectedTextfield.Texture.text.length < selectedTextfield.maxLength || e.key === "Backspace" ||  e.key === "Delete")
                        {
                        switch(e.key)
                        {
                            case "Backspace":
                                if(selectedTextfield.Texture.text.length != 0 && selectedTextfield.cursorPosition > 0)
                                {
                                    let substr = 
                                        selectedTextfield.Texture.text.slice(0,selectedTextfield.cursorPosition-1) + 
                                        selectedTextfield.Texture.text.slice(selectedTextfield.cursorPosition);

                                    selectedTextfield.Texture.text = substr;
                                    selectedTextfield.cursorPosition--;
                                }
                                break;
                            case "Delete":
                                if(selectedTextfield.Texture.text.length != 0 && selectedTextfield.cursorPosition > 0)
                                {
                                    let substr = 
                                        selectedTextfield.Texture.text.slice(0,selectedTextfield.cursorPosition) + 
                                        selectedTextfield.Texture.text.slice(selectedTextfield.cursorPosition+1);

                                    selectedTextfield.Texture.text = substr;
                                }
                                break;
                            case "Space":
                                selectedTextfield.Texture.text += " ";
                                selectedTextfield.cursorPosition++;
                                break;
                            case "AltGraph":
                                break;
                            case "Shift":
                                break;
                            case "Control":
                                break;
                            case "ArrowLeft":
                                if(selectedTextfield.cursorPosition > 0)
                                {
                                    selectedTextfield.cursorPosition--;
                                }
                                break;
                            case "ArrowRight":
                                if(selectedTextfield.cursorPosition < selectedTextfield.Texture.text.length)
                                {
                                    selectedTextfield.cursorPosition++;
                                }
                                break;
                            default:
                                selectedTextfield.Texture.text += e.key;
                                selectedTextfield.cursorPosition++;
                                break;
                        }
                        }
                    }
                    

                    if (e.key === "ArrowDown" && debug) 
                    {
                        frameIncrements--;
                    } 
                    else if(e.key === "ArrowUp" && debug)
                    {
                        frameIncrements++;
                    }
                    else if(e.key === "ArrowLeft" && debug)
                    {
                        updateIntervals++;
                        this.clearInterval(myGameArea.interval);
                        myGameArea.interval = setInterval(updateGameArea, updateIntervals);
                    }
                    else if(e.key === "ArrowRight" && debug)
                    {
                        updateIntervals--;
                        this.clearInterval(myGameArea.interval);
                        myGameArea.interval = setInterval(updateGameArea, updateIntervals);
                    }
                    else if(e.key === "0" || e.key === "1" || e.key === "2" || e.key === "3" || e.key === "4" || e.key === "5" || e.key === "6" || e.key === "7" || e.key === "8" || e.key === "9")
                    {
                        if(debug)
                        {
                            switch(e.key)
                            {
                                case "0":
                                    cigarettes += 10;
                                    break;
                                case "1":
                                    cigarettes += 1000;
                                    break;
                                case "2":
                                    cigarettes += 100000;
                                    break;
                                case "3":
                                    cigarettes += 10000000;
                                    break;
                                case "4":
                                    cigarettes += 1000000000;
                                    break;
                                case "5":
                                    cigarettes += 100000000000;
                                    break;
                                case "6":
                                    cigarettes += 10000000000000;
                                    break;
                                case "7":
                                    upgradeCigarettes += 10;
                                    break;
                                case "8":
                                    upgradeCigarettes += 1000;
                                    break;
                                case "9":
                                    premiumCigarettes += 10;
                                    break;
                            }
                        }
                    }
                    else if(e.key === "#")
                    {
                        if(!debug)
                        {
                            debug = true;
                            this.alert("DEBUG MODE ACTIVATED!");
                        }
                        else
                        {
                            debug = false;
                            this.alert("DEBUG MODE DEACTIVATED!");
                        }
                    }
                    else if(e.key === "+" && debug)
                    {
                        smokinAnimation.sizeX = canvas.width;
                        smokinAnimation.sizeY = canvas.height;
                        smokinAnimation.setActive(true);
                        smokinAnimation.manipulateAnimation("setFrame", 0);
                    }
                    else if(e.key === "-" && debug)
                    {
                        trumpAnimation.setActive(true);
                        trumpAnimation.manipulateAnimation("teleport", [-800, canvas.height / 2 - 400]);
                        trumpAnimation.manipulateAnimation("setFrame", 0);
                        trumpAnimation.behaviour = [["move", 4, 0], ["killSelfOnPositionX", canvas.width]];
                    }
                    else if(e.key === "l" && debug)
                    {
                        if(currentActiveScene == EScenes.FACTORY)
                        {
                            currentActiveScene = EScenes.OFFICE;
                        }
                        else if(currentActiveScene == EScenes.OFFICE)
                        {
                            currentActiveScene = EScenes.FACTORY;
                        }
                    }
                    else if(e.key === "d" && debug)
                    {
                        downloadSaveState({
                            gameName: gameName, 
                            cigarettes: cigarettes, 
                            upgradeCigarettes: upgradeCigarettes, 
                            premiumCigarettes: premiumCigarettes
                        });
                    }
                    else if(e.key === "r" && debug)
                    {
                        loadSaveState();
                    }
                });
                    
                window.addEventListener('resize', function() 
                {
                    document.getElementById("canvas").width = window.innerWidth;
                    document.getElementById("canvas").height = window.innerHeight;
                    realignGUI();
                });
            }



            var myGameArea = 
            {
                canvas : document.getElementById("canvas"),
                start : function() {
                    this.canvas.width = window.innerWidth;
                    this.canvas.height = window.innerHeight;
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
                ctx.textAlign = "left";
                ctx.textBaseline = "middle"; // center aint a valid value here...lovely javascript
                ctx.font = "20px Arial";
                ctx.strokeStyle = "Black";
                ctx.fillStyle = "Black";


                if(allowMusic && audio.paused)
                {
                    audio.volume = 0.3;
                    audio.play();
                }


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
                techtreePanelOffsetY = Math.max(-1000, Math.min(-500, techtreePanelOffsetY));

                 techtreeUpgrades.forEach(element => {
                    element.offset[0] = techtreePanelOffsetX;
                    element.offset[1] = techtreePanelOffsetY;
                    element.Tooltip.offset[0] = techtreePanelOffsetX;
                    element.Tooltip.offset[1] = techtreePanelOffsetY;
                });// panel handles the positioning 

                closeButton.x = techtreePannel.x + techtreePannel.sizeX - 35;
                closeButton.y = techtreePannel.y + 5;
            }   
            



        function drawFactoryBackground()
        {
            for(let j = 0; j < (WORLD_WIDTH + myGameArea.canvas.width) / backgroundDetail; j++)
            {
                for(let i = 0; i < myGameArea.canvas.height / backgroundDetail + 1; i++)
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

            nameTextfield.sizeX = myGameArea.canvas.width / 7.8;
            nameTextfield.sizeY = myGameArea.canvas.height / 11;
            


            techtreePannel.sizeX = myGameArea.canvas.width - 100;
            techtreePannel.sizeY = myGameArea.canvas.height - 100;
            
            audioButton.x = myGameArea.canvas.width - 60;
            audioButton.y = myGameArea.canvas.height - 60;
            soundButton.x = myGameArea.canvas.width - 60;
            soundButton.y = myGameArea.canvas.height - 120;
            achievementButton.x = myGameArea.canvas.width - 60;
            achievementButton.y = myGameArea.canvas.height - 180;
            
            achievementPanel.x = 33;
            achievementPanel.y = 63;
            achievementPanel.sizeX = myGameArea.canvas.width - 90;
            achievementPanel.sizeY = myGameArea.canvas.height - 90;
            closeAchievementsButton.x = achievementPanel.x + achievementPanel.sizeX - 35;
            closeAchievementsButton.y = achievementPanel.y + 10;
            
            techtreeButton.x = myGameArea.canvas.width / 2 - 400;
            namePanel.x = myGameArea.canvas.width / 2 - 140;
            nameLabel.x = myGameArea.canvas.width / 2 - 140;
            WOFbutton.x = myGameArea.canvas.width / 2 + 200;
        }
        



        function spawnCigarettesOnConveyer()
        {
            for(let i = 0; i < machineLevels.length; i++)
            {
                if(machineLevels[i] > 0)
                {
                    if(frame % 500 == 0)
                    {
                        if(Math.random() * 100 <= 1 + 0.1 * machineLevels[i])
                        {
                            const cigProduction =  new canvasButton(
                            machineX(i) + 190, 
                            760 + 256 / 2 - 50, 
                            64, 
                            64,
                            new canvasButtonTexture(premiumCigarettesTexture, "", ""),
                            false,
                            true
                            );

                            cigProduction.zPosition = -1;
                            factorySceneUI.add(cigProduction);
                            animatedCigarettes.push({obj: cigProduction, lifetime: 0});
                        
                            cigProduction.onClick = function()
                            {
                                premiumCigarettes += 1 * (i + 1);
                                if(allowAudio)
                                {
                                    const newAudio = new Audio('Audio/Collect.wav');
                                    newAudio.play();
                                }
                            
                                factorySceneUI.elements.splice(factorySceneUI.elements.indexOf(cigProduction),1);
                                const index = animatedCigarettes.findIndex(entry => entry.obj === cigProduction);
                                animatedCigarettes.splice(index, 1);
                            }
                        }
                        else
                        {
                            const cigProduction =  new canvasButton(
                            machineX(i) + 190, 
                            760 + 256 / 2 - 50, 
                            64, 
                            64,
                            new canvasButtonTexture(cigarettesTexture, "", ""),
                            false,
                            true
                            );

                            cigProduction.zPosition = -1;
                            factorySceneUI.add(cigProduction);
                            animatedCigarettes.push({obj: cigProduction, lifetime: 0});
                        
                            cigProduction.onClick = function()
                            {
                                cigarettes += cigarettesGain * gameState["cigarettesGainMultiplier"] * 200;

                                if(allowAudio)
                                {
                                    const newAudio = new Audio('Audio/Collect.wav');
                                    newAudio.play();
                                }
                            
                                factorySceneUI.elements.splice(factorySceneUI.elements.indexOf(cigProduction),1);
                                const index = animatedCigarettes.findIndex(entry => entry.obj === cigProduction);
                                animatedCigarettes.splice(index, 1);
                            }
                        }
                    }
                }
            }
        }


        function particleGarbageCollector()
        {
            for(let i = currentActiveParticleEmitter.length - 1; i >= 0; i--) // so particles appear correctly
            {
                if(currentActiveParticleEmitter[i].emitterlifetime > 0)
                {
                    currentActiveParticleEmitter[i].spawnParticle();
                }
                else if(currentActiveParticleEmitter[i].particleChildren && currentActiveParticleEmitter[i].particleChildren.length == 0)
                {
                    currentActiveParticleEmitter.splice(i, 1);
                }
                else if(currentActiveParticleEmitter[i].pulseChildren && currentActiveParticleEmitter[i].pulseChildren.length == 0)
                {
                    currentActiveParticleEmitter.splice(i, 1);
                }
            }
        }

        function moveCigarettesAlongConveyer()
        {
            animatedCigarettes.forEach(element => {
                if(element.lifetime > 800)
                {
                    element.obj.alpha = Math.sin(element.lifetime * (element.lifetime / 12000)) / 2 + 0.75;
                }
        
                if(frame % Math.round(50 / 4) == 0)
                    {
                        element.obj.x += 4;
                    }
                element.lifetime++; // Lifetime
                if(element.lifetime > 1250)
                {
                    element.obj.y += 1;
                    
                }
                if(element.lifetime > 1300)
                {
                    factorySceneUI.elements.splice(factorySceneUI.elements.indexOf(element.obj),1);
                    animatedCigarettes.splice(animatedCigarettes.indexOf(element), 1);
                }
                });
        }


        function drawIntroScene()
        {
            const now = performance.now();
            const dt = (now - lastTime) / 1000; // seconds

            ctx.clearRect(0, 0, canvas.width, canvas.height);

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
                            layers.forEach(layer => {
                                    layer.update(direction, dt, preGameLoadupIterator)
                                    if(layer.name == "Factory")
                                    {
                                        //this.x += direction * this.speed * dt;
                                        //this.y = Math.round(preGameOffset * this.speed * 4 / 4) * 4;
                                        //myGameArea.canvas.width / 2 - (myGameArea.canvas.width / 4 / 2)
                                        
                                        nameTextfield.x = Math.round(layer.x * 2) +     myGameArea.canvas.width / 2 + (myGameArea.canvas.width / 2.7 / 2);
                                        nameTextfield.y = layer.y +                     myGameArea.canvas.height / 2 + (myGameArea.canvas.height / 3 / 4);
                                    }
                                }
                            );
                            layers.forEach(layer => layer.draw(ctx, myGameArea.canvas));
                            drawStartButton();
                            introSceneUI.draw(ctx, true);
                        }
                        else
                        {
                            layers.forEach(layer => layer.update(direction, dt, 150));
                            layers.forEach(layer => layer.draw(ctx, myGameArea.canvas));
                            preGameLoadupIterator--;
                        }
                
                        startScreenAnimationIterator++;
                        clientClick = false;
                    }
        }




        // Update Loop
        function updateGameArea()
        {
            if (SceneManager.currentScene !== SceneManager.scenes[currentActiveScene]) 
            {
                SceneManager.setScene(currentActiveScene);
            }

            update();
            frame += frameIncrements;


            // Update all Animations
            SceneManager.update(frame);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(-camera.x, -camera.y);

            // Kill unused Emitter and Particles
            particleGarbageCollector();


            
            

            // Only for World-Positioned Elements
            switch(currentActiveScene)
            {
                case EScenes.INTRO:
                    break;

                case EScenes.FACTORY: 

                    drawFactoryBackground();
                    drawButtonsAndLabels();

                    // Cigarettes-Conveyer machanic
                    spawnCigarettesOnConveyer();
                    moveCigarettesAlongConveyer();
                    break;
                case EScenes.OFFICE:

                    drawOfficeBackground();
                    break;
            }
            if(gameStarted)
            {
                SceneManager.draw(ctx, false);
            }



            ctx.restore();



            

            // Only for Camera-Positioned Elements
            switch(currentActiveScene)
            {
                case EScenes.INTRO:
                    drawIntroScene();
                    return;
                case EScenes.FACTORY: 

                
                drawCurrencyPanel();
                
                updateUpgradeButtons();
                
                cigarettes += cigarettesGain * gameState["cigarettesGainMultiplier"];
                break;
                case EScenes.OFFICE:
                    drawCurrencyPanel();
                    break;
            }
            if(gameStarted)
            {
                SceneManager.draw(ctx, true);
            }
                
            handleWheelOfFortune();
            handleTechtreeSpecificBehaviour();

            displayDebugInfo();



            // Hover-Check (Speciffically for that bitch of a start-button)
            globalUI.onHoverCheck(cursorX, cursorY, ctx);

            clientClick = false;
        }


        function displayDebugInfo()
        {
            // Debug Info
            if(debug)
            {  
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
                    if(element.particleChildren)
                    {
                        element.particleChildren.forEach(e => {
                            particleAmount++;
                        });
                    }
                    if(element.pulseChildren)
                    {
                        element.pulseChildren.forEach(e => {
                            particleAmount++;
                        });
                    }
                });
                
                ctx.fillText("Particle Amount: " + particleAmount, 20, 140);


                let CAA = 0;
                factorySceneUI.elements.forEach(element => {
                        if(element.step && element.active)
                        {
                            CAA++;
                        }
                    }
                );
                ctx.fillText("Active Animations: " + CAA, 20, 170);
            }
        }


        function updateUpgradeButtons()
        {
            for(let i = 0; i < upgradeButtons.length; i++)
            {
                if(cigarettes >  Math.ceil((machineBaseCosts[i] * machineCostMultipliers[i]) / gameState["generalCostReduction"]) || upgradeButtons[i].Texture.text == "Free")
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
                    BatchCost += Math.ceil((machineBaseCosts[i] * (machineCostMultipliers[i] * Math.pow(1.1, j))) / gameState["generalCostReduction"]);
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
                    BatchCost += Math.ceil((machineBaseCosts[i] * (machineCostMultipliers[i] * Math.pow(1.1, j))) / gameState["generalCostReduction"]);
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


        function handleTechtreeSpecificBehaviour()
        {
            if(techtreePannel.active)
            {
                techtreeUpgrades.forEach(element => 
                {
                    if(inBoundChecker(element, techtreePannel))
                    {
                        element.drawConnections(ctx, techtreeUpgrades);
                    }
                });

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

            ctx.globalAlpha = 1;
            ctx.drawImage(cigarettesTexture, canvas.width + CIGARETTESPANELOFFSET + 200, 5, 50, 50);
            ctx.drawImage(upgradeCigarettesTexture, canvas.width + CIGARETTESPANELOFFSET + 200, 65, 50, 50);
            ctx.drawImage(premiumCigarettesTexture, canvas.width + CIGARETTESPANELOFFSET + 200, 125, 50, 50);
            ctx.fillStyle = "rgba(0,0,0,1)";
            ctx.font = "28px Titanic";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle"; // center aint a valid value here...lovely javascript
            ctx.strokeStyle = "Black";


            // Normal Cigarettes
            switch (true) 
            {
                case cigarettes > 1000000000000000000000:
                    ctx.fillText((cigarettes / 1000000000000000000000).toFixed(2) + "Sxl", canvas.width + CIGARETTESPANELOFFSET + 80, 42);
                    break;
                case cigarettes > 1000000000000000000:
                    ctx.fillText((cigarettes / 1000000000000000000).toFixed(2) + "Qil", canvas.width + CIGARETTESPANELOFFSET + 80, 42);
                    break;
                case cigarettes > 1000000000000000:
                    ctx.fillText((cigarettes / 1000000000000000).toFixed(2) + "Qal", canvas.width + CIGARETTESPANELOFFSET + 80, 42);
                    break;
                case cigarettes > 1000000000000:
                    ctx.fillText((cigarettes / 1000000000000).toFixed(2) + "Trl", canvas.width + CIGARETTESPANELOFFSET + 80, 42);
                    break;
                case cigarettes > 1000000000:
                    ctx.fillText((cigarettes / 1000000000).toFixed(2) + "Bil", canvas.width + CIGARETTESPANELOFFSET + 80, 42);
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

            // Upgrade Cigarettes
            switch (true) 
            {
                case upgradeCigarettes > 1000000000000000000000:
                    ctx.fillText((upgradeCigarettes / 1000000000000000000000).toFixed(2) + "Sxl", canvas.width + CIGARETTESPANELOFFSET + 80, 102);
                    break;
                case upgradeCigarettes > 1000000000000000000:
                    ctx.fillText((upgradeCigarettes / 1000000000000000000).toFixed(2) + "Qil", canvas.width + CIGARETTESPANELOFFSET + 80, 102);
                    break;
                case upgradeCigarettes > 1000000000000000:
                    ctx.fillText((upgradeCigarettes / 1000000000000000).toFixed(2) + "Qal", canvas.width + CIGARETTESPANELOFFSET + 80, 102);
                    break;
                case upgradeCigarettes > 1000000000000:
                    ctx.fillText((upgradeCigarettes / 1000000000000).toFixed(2) + "Trl", canvas.width + CIGARETTESPANELOFFSET + 80, 102);
                    break;
                case upgradeCigarettes > 1000000000:
                    ctx.fillText((upgradeCigarettes / 1000000000).toFixed(2) + "Bil", canvas.width + CIGARETTESPANELOFFSET + 80, 102);
                    break;
                case upgradeCigarettes > 1000000:
                    ctx.fillText((upgradeCigarettes / 1000000).toFixed(2) + "Mil", canvas.width + CIGARETTESPANELOFFSET + 80, 102);
                    break;
                case upgradeCigarettes > 1000:
                    ctx.fillText((upgradeCigarettes / 1000).toFixed(2) + "Tsd", canvas.width + CIGARETTESPANELOFFSET + 80, 102);
                    break;
                default:
                    ctx.fillText(upgradeCigarettes, canvas.width + CIGARETTESPANELOFFSET + 80, 102);
                    break;
            }

            // Premium Cigarettes
            switch (true) 
            {
                case premiumCigarettes > 1000000000000000000000:
                    ctx.fillText((premiumCigarettes / 1000000000000000000000).toFixed(2) + "Sxl", canvas.width + CIGARETTESPANELOFFSET + 80, 162);
                    break;
                case premiumCigarettes > 1000000000000000000:
                    ctx.fillText((premiumCigarettes / 1000000000000000000).toFixed(2) + "Qil", canvas.width + CIGARETTESPANELOFFSET + 80, 162);
                    break;
                case premiumCigarettes > 1000000000000000:
                    ctx.fillText((premiumCigarettes / 1000000000000000).toFixed(2) + "Qal", canvas.width + CIGARETTESPANELOFFSET + 80, 162);
                    break;
                case premiumCigarettes > 1000000000000:
                    ctx.fillText((premiumCigarettes / 1000000000000).toFixed(2) + "Trl", canvas.width + CIGARETTESPANELOFFSET + 80, 162);
                    break;
                case premiumCigarettes > 1000000000:
                    ctx.fillText((premiumCigarettes / 1000000000).toFixed(2) + "Bil", canvas.width + CIGARETTESPANELOFFSET + 80, 162);
                    break;
                case premiumCigarettes > 1000000:
                    ctx.fillText((premiumCigarettes / 1000000).toFixed(2) + "Mil", canvas.width + CIGARETTESPANELOFFSET + 80, 162);
                    break;
                case premiumCigarettes > 1000:
                    ctx.fillText((premiumCigarettes / 1000).toFixed(2) + "Tsd", canvas.width + CIGARETTESPANELOFFSET + 80, 162);
                    break;
                default:
                    ctx.fillText(premiumCigarettes, canvas.width + CIGARETTESPANELOFFSET + 80, 162);
                    break;
            }
        }




        function drawButtonsAndLabels()
        {
            for(let i = 0; i < upgradeButtons.length; i++)
            {
                const val = Math.ceil((machineBaseCosts[i] * machineCostMultipliers[i]) / gameState["generalCostReduction"]);

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


        function drawWheel()
        {

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const radius = 200;

            ctx.save();

            ctx.translate(cx,cy);
            ctx.rotate(WOFrotation);
            ctx.translate(-cx,-cy);

            for(let i=0;i<segments.length;i++)
            {

                let start = slice*i;
                let end = slice*(i+1);

                ctx.beginPath();
                ctx.moveTo(cx,cy);
                ctx.arc(cx,cy,radius,start,end);
                ctx.closePath();

                ctx.fillStyle = colors[i];
                ctx.fill();

                ctx.stroke();
                
                ctx.save();

                ctx.translate(cx,cy);
                ctx.rotate(start + slice/2);
                ctx.textAlign="right";
                ctx.fillStyle="white";
                ctx.font="16px Arial";
                ctx.fillText(segments[i], radius-10,5);

                ctx.restore();
            }

            ctx.restore();
            
            drawPointer();
        }


function drawPointer()
{

    const cx = canvas.width / 2 + 210;
    const cy = canvas.height / 2 ;
    const radius = 200;

    ctx.fillStyle = "red";

    ctx.beginPath();
    ctx.moveTo(cx,cy+10);
    ctx.lineTo(cx,cy-10);
    ctx.lineTo(cx-30,cy);
    ctx.closePath();

    ctx.fill();
}


function spin()
{
    WOFpanel.setActive(true);
    claimButton.setActive(false);
    prizeLabel.setActive(false);

    prizeClaimed = false;

    if(WOFspinning) return;

    WOFvelocity = Math.random()*0.35 + 0.25;
    WOFspinning = true;
}


function detectPrize()
{

    let degrees = WOFrotation * 180 / Math.PI;
    let normalized = degrees % 360;

    let sliceDeg = 360 / segments.length;

    let index = Math.floor((360 - normalized) / sliceDeg) % segments.length;

    let prize = segments[index];
    
    switch(prize) {
        case "100 Cigarettes":  cigarettes += 100; if(allowAudio){Win.play()};  break;
        case "50 Cigarettes":   cigarettes += 50; if(allowAudio){Win.play()};   break;
        case "150 Cigarettes":  cigarettes += 150; if(allowAudio){Win.play()};  break;
        case "200 Cigarettes":  cigarettes += 200; if(allowAudio){Win.play()};  break;
        case "75 Cigarettes":   cigarettes += 75; if(allowAudio){Win.play()};   break;
        case "Spin Again":
            prizeLabel.Texture.text = "Spin Again!";
            prizeLabel.setActive(true);
            setTimeout(() => spin(), 1000);
            break;
        case "Nothing":
            break;
        case "JACKPOT":
            cigarettes += 10000;
            break;
    }
    

    prizeLabel.Texture.color = "Black";
    prizeLabel.Texture.text = prize;
    prizeLabel.setActive(true);
    claimButton.setActive(true);


    if(prize === "JACKPOT")
    {
        partyInterval = setInterval(spawnAPulse, 10);
        prizeLabel.Texture.color = "Red";
        prizeLabel.Texture.text = "!!! JACKPOT !!!";
        trumpAnimation.setActive(true);
        trumpAnimation.manipulateAnimation("teleport", [-800, canvas.height / 2 - 400]);
        trumpAnimation.manipulateAnimation("setFrame", 0);
        trumpAnimation.behaviour = [["move", 4, 0], ["killSelfOnPositionX", canvas.width]];
        jackpot.volume = 0.5;
        if(allowMusic)
        {
            jackpot.play();
        }
    }

    if(prize === "Spin Again")
    {
        prizeLabel.Texture.color = "Black";
        prizeLabel.Texture.text = "Spin Again!";
        prizeLabel.setActive(true);
        // no claimButton, wheel just re-spins automatically
        setTimeout(() => spin(), 1000);
        return;
    }

}

function spawnAPulse()
{
    currentActiveParticleEmitter.push(
        new pulseEmitter(
            Math.floor(Math.random() * canvas.width), 
            Math.floor(Math.random() * canvas.height),
            "rgb("+ Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + ", " + Math.floor(Math.random() * 255) + ")",
            0.2,
            Math.floor(Math.random() * 5),
            100,
            40,
            true,
            true
        )
    );
    currentActiveParticleEmitter[currentActiveParticleEmitter.length-1].alpha = 0.1;
    factorySceneUI.add(currentActiveParticleEmitter[currentActiveParticleEmitter.length-1]);
}

function handleWheelOfFortune()
{
    if(WOFspinning || !prizeClaimed)
    {

        WOFrotation += WOFvelocity;
        WOFvelocity *= 0.985;

        if(WOFvelocity < 0.0002 && !prizeClaimed && WOFspinning)
        {
            WOFspinning = false;
            detectPrize();
        }
                
        drawWheel();
    }
}


function drawOfficeBackground()
{
    for(let j = 0; j < (WORLD_WIDTH + myGameArea.canvas.width) / backgroundDetail; j++)
    {
        if(j % 4 == 2 || j % 4 == 3)
        {
            for(let i = 0; i < myGameArea.canvas.height / backgroundDetail; i++)
            {
            if(i + 3 < myGameArea.canvas.height / backgroundDetail)
            {
                if(i % 5 == 0 || i % 5 == 1)
                {
                    ctx.fillStyle = "rgb(179, 179, 255)";
                    ctx.fillRect(backgroundDetail * j + j * -1, i * backgroundDetail + i * -1, backgroundDetail, backgroundDetail);
                    //ctx.drawImage(bricks, backgroundDetail * j + j * -1, i * backgroundDetail + i * -1, backgroundDetail, backgroundDetail);
                }
                else
                {
                    ctx.fillStyle = "White";
                    ctx.fillRect(backgroundDetail * j + j * -1, i * backgroundDetail + i * -1, backgroundDetail, backgroundDetail);
                    //ctx.drawImage(bricks, backgroundDetail * j + j * -1, i * backgroundDetail + i * -1, backgroundDetail, backgroundDetail);
                }
            }
            else if(i + 2 < myGameArea.canvas.height / backgroundDetail)
            {
                ctx.fillStyle = "Grey";
                ctx.fillRect(backgroundDetail * j + j * -1, i * backgroundDetail + i * -1, backgroundDetail, backgroundDetail);
                //ctx.drawImage(bricksGroundBordered, backgroundDetail * j + j * -1, i * backgroundDetail + i * -1, backgroundDetail, backgroundDetail);
            }
            else
            {
                ctx.fillStyle = "Black";
                ctx.fillRect(backgroundDetail * j + j * -1, i * backgroundDetail + i * -1, backgroundDetail, backgroundDetail);
                //ctx.drawImage(bricksGround, backgroundDetail * j + j * -1, i * backgroundDetail + i * -1, backgroundDetail, backgroundDetail);
            }
            }
        }
        else
        {
            for(let i = 0; i < myGameArea.canvas.height / backgroundDetail; i++)
            {
            if(i + 3 < myGameArea.canvas.height / backgroundDetail)
            {
                ctx.fillStyle = "White";
                ctx.fillRect(backgroundDetail * j + j * -1, i * backgroundDetail + i * -1, backgroundDetail, backgroundDetail);
                //ctx.drawImage(bricks, backgroundDetail * j + j * -1, i * backgroundDetail + i * -1, backgroundDetail, backgroundDetail);
            }
            else if(i + 2 < myGameArea.canvas.height / backgroundDetail)
            {
                ctx.fillStyle = "Grey";
                ctx.fillRect(backgroundDetail * j + j * -1, i * backgroundDetail + i * -1, backgroundDetail, backgroundDetail);
                //ctx.drawImage(bricksGroundBordered, backgroundDetail * j + j * -1, i * backgroundDetail + i * -1, backgroundDetail, backgroundDetail);
            }
            else
            {
                ctx.fillStyle = "Black";
                ctx.fillRect(backgroundDetail * j + j * -1, i * backgroundDetail + i * -1, backgroundDetail, backgroundDetail);
                //ctx.drawImage(bricksGround, backgroundDetail * j + j * -1, i * backgroundDetail + i * -1, backgroundDetail, backgroundDetail);
            }
            }
        }
    }
}


function arrayBufferToHex(buffer) {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

function hexToArrayBuffer(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes.buffer;
}

async function encryptTextWithPassword(text, password) {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const keyMaterial = await crypto.subtle.importKey(
        'raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
    );
    const key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
    );
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv }, key, encoder.encode(text)
    );

    return {
    cipherText: arrayBufferToHex(encrypted),
    iv: Array.from(iv),
    salt: Array.from(salt)
    };
}



async function decryptTextWithPassword(data, password) {
    const encoder = new TextEncoder();

    const salt = new Uint8Array(data.salt);
    const iv = new Uint8Array(data.iv);
    const encryptedBuffer = hexToArrayBuffer(data.cipherText);

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedBuffer
    );

    return new TextDecoder().decode(decrypted);
}

async function downloadSaveState(content)
{
    console.log(content);
    const data = await encryptTextWithPassword(JSON.stringify(content), "Password");
    console.log(data);
    const blob = new Blob([JSON.stringify(data)], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Tabak-Trafik - " + gameName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function loadSaveState() {
    try {
        const fileContent = await promptLoadSaveFile();

        const parsed = JSON.parse(fileContent);
        const decrypted = await decryptTextWithPassword(parsed, "Password");
        const gameState = JSON.parse(decrypted);

        // Setting of varriables from Savestate!!!
        gameName = JSON.parse(decrypted).gameName;
        nameLabel.Texture.text = gameName;
        cigarettes = Number(JSON.parse(decrypted).cigarettes);
        upgradeCigarettes = Number(JSON.parse(decrypted).upgradeCigarettes);
        premiumCigarettes = Number(JSON.parse(decrypted).premiumCigarettes);

        console.log("Loaded state:", gameState);
    } catch (err) {
        console.error("Failed to load save:", err);
    }
}

function promptLoadSaveFile() {
    return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "*/*"; // or ".sav" if you define an extension

        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) {
                reject("No file selected");
                return;
            }

            try {
                const text = await file.text(); // reads as string
                resolve(text);
            } catch (err) {
                reject(err);
            }
        };

        input.click();
    });
}

function checkAchievementsCollection()
{
    achievementCollection.forEach(achievement => {
        achievement.forEach(effect => {

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
    });
}