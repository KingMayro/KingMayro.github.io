    const frogContainers = document.querySelectorAll('.frog-container');
    const frames = {
        facingRight: ['Right.png'],
        facingLeft: ['Left.png'],
        facingViewer: ['Idle.png']
    };

    const animations = {
        TurnLeft: [
            {src: "Idle.png", duration: 100},
            {src: "MidLeft.png", duration: 100},
            {src: "Left.png", duration: 100}
        ],
        TurnRight: [
            {src: "Idle.png", duration: 100},
            {src: "MidRight.png", duration: 100},
            {src: "Right.png", duration: 100}
        ],
        LeftReturn: [
            {src: "Left.png", duration: 100},
            {src: "MidLeft.png", duration: 100},
            {src: "Idle.png", duration: 100}
        ],
        RightReturn: [
            {src: "Right.png", duration: 100},
            {src: "MidRight.png", duration: 100},
            {src: "Idle.png", duration: 100}
        ],
        CroakLeft: [
            {src: "Left.png", duration: 100},
            {src: "MidCroakLeft.png", duration: 100},
            {src: "MaxCroakLeft.png", duration: 100},
            {src: "MidCroakLeft.png", duration: 100},
            {src: "Left.png", duration: 100}
        ],
        CroakRight: [
            {src: "Right.png", duration: 100},
            {src: "MidCroakRight.png", duration: 100},
            {src: "MaxCroakRight.png", duration: 100},
            {src: "MidCroakRight.png", duration: 100},
            {src: "Right.png", duration: 100}
        ],
        JumpLeft: [
            {src: "Left.png", duration: 100},
            {src: "JumpUpLeft.png", duration: 100},
            {src: "FallDownLeft.png", duration: 100},
            {src: "Left.png", duration: 100}
        ],
        JumpRight: [
            {src: "Right.png", duration: 100},
            {src: "JumpUpRight.png", duration: 100},
            {src: "FallDownRight.png", duration: 100},
            {src: "Right.png", duration: 100}
        ],
        Blink: [
            {src: "Idle.png", duration: 100},
            {src: "Blink.png", duration: 100},
            {src: "Idle.png", duration: 100}
        ],
        Croak: [
            {src: "Idle.png", duration: 100},
            {src: "MidCroak.png", duration: 100},
            {src: "MaxCroak.png", duration: 100},
            {src: "MidCroak.png", duration: 100},
            {src: "Idle.png", duration: 100}
        ],
        Tongue: [
            {src: "Idle.png", duration: 70},
            {src: "LipUp.png", duration: 70},
            {src: "TongueBounce.png", duration: 70},
            {src: "Tongue.png", duration: 70}
        ],
        Ribbit: [
            {src: "Idle.png", duration: 100},
            {src: "Smile.png", duration: 50},
            {src: "MaxRibbit.png", duration: 100},
            {src: "MidRibbit.png", duration: 100},
            {src: "MinRibbit.png", duration: 100},
            {src: "Idle.png", duration: 100}
        ]
    };

    const sounds = {
        Ribbit: new Audio('Ribbit.ogg'),
        Tongue: new Audio('Tongue.ogg'),
        Mute: new Audio('Mute.ogg'),
        Unmute: new Audio('Unmute.ogg')
    };

    let currentStates = ['Idle.png', 'Idle.png', 'Idle.png'];
    let facings = ['viewer', 'viewer', 'viewer'];
    let currentFrameStarts = [Date.now(), Date.now(), Date.now()];
    let verticalDraggingEnabled = true;
    let isMuted = false;

    // Preload images and sounds
    Object.values(animations).flat().forEach(frame => {
        const img = new Image();
        img.src = frame.src;
    });

    const numberOfFrogs = Math.random() < 0.4 ? 3 : 2;

    const verticalPosition = window.innerHeight - 137;
    frogContainers.forEach((container, index) => {
        if (index < numberOfFrogs) {
            let horizontalPosition;
            do {
                horizontalPosition = Math.random() * (window.innerWidth - 150);
            } while (isTooCloseToOtherFrog(horizontalPosition, index));
            container.style.left = `${horizontalPosition}px`;
            container.style.top = `${verticalPosition}px`;
            container.style.display = 'block';
            container.addEventListener('mousedown', (event) => {
                startDrag(event, container);
            });
        }
    });

    function isTooCloseToOtherFrog(position, currentIndex) {
        const minDistance = 150;
        for (let i = 0; i < currentIndex; i++) {
            const rect = frogContainers[i].getBoundingClientRect();
            const distance = Math.abs(position - rect.left);
            if (distance < minDistance) {
                return true;
            }
        }
        return false;
    }

    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function transitionTo(index, animation) {
        currentStates[index] = animation[0].src;
        let frameIndex = 0;

        const nextFrame = () => {
            const frame = animation[frameIndex];
            const newFrogElement = document.createElement('img');
            newFrogElement.src = frame.src;
            newFrogElement.className = 'frog';
            newFrogElement.onload = () => {
                const oldFrogElement = frogContainers[index].querySelector('.frog');
                if (oldFrogElement) {
                    frogContainers[index].removeChild(oldFrogElement);
                }
                frogContainers[index].appendChild(newFrogElement);
            };

            if (frameIndex < animation.length - 1) {
                frameIndex++;
                setTimeout(nextFrame, frame.duration);
            }
        };

        nextFrame();
    }

    function playSound(action) {
        if (!isMuted && sounds[action]) {
            sounds[action].play();
        }
    }

    function moveFrog(index) {
        const actions = ['faceRight', 'faceLeft', 'doViewerAction'];
        const action = getRandomElement(actions);

        if (action === 'faceRight' && facings[index] !== 'right') {
            if (facings[index] === 'left') {
                transitionTo(index, animations.LeftReturn);
                setTimeout(() => {
                    transitionTo(index, animations.TurnRight);
                    facings[index] = 'right';
                    setTimeout(() => {
                        const rightActions = ['CroakRight', 'JumpRight'];
                        const nextAction = getRandomElement(rightActions);
                        transitionTo(index, animations[nextAction]);
                        if (nextAction === 'JumpRight') {
                            jumpFrog(index, 10, 'right');
                        }
                    }, 300);
                }, 300);
            } else {
                transitionTo(index, animations.TurnRight);
                facings[index] = 'right';
                setTimeout(() => {
                    const rightActions = ['CroakRight', 'JumpRight'];
                    const nextAction = getRandomElement(rightActions);
                    transitionTo(index, animations[nextAction]);
                    if (nextAction === 'JumpRight') {
                        jumpFrog(index, 10, 'right');
                    }
                }, 300);
            }
        }

        if (action === 'faceLeft' && facings[index] !== 'left') {
            if (facings[index] === 'right') {
                transitionTo(index, animations.RightReturn);
                setTimeout(() => {
                    transitionTo(index, animations.TurnLeft);
                    facings[index] = 'left';
                    setTimeout(() => {
                        const leftActions = ['CroakLeft', 'JumpLeft'];
                        const nextAction = getRandomElement(leftActions);
                        transitionTo(index, animations[nextAction]);
                        if (nextAction === 'JumpLeft') {
                            jumpFrog(index, 10, 'left');
                        }
                    }, 300);
                }, 300);
            } else {
                transitionTo(index, animations.TurnLeft);
                facings[index] = 'left';
                setTimeout(() => {
                    const leftActions = ['CroakLeft', 'JumpLeft'];
                    const nextAction = getRandomElement(leftActions);
                    transitionTo(index, animations[nextAction]);
                    if (nextAction === 'JumpLeft') {
                        jumpFrog(index, 10, 'left');
                    }
                }, 300);
            }
        }

        if (action === 'doViewerAction') {
            if (facings[index] === 'right') {
                transitionTo(index, animations.RightReturn);
                setTimeout(() => {
                    facings[index] = 'viewer';
                    performViewerAction(index);
                }, 300);
            } else if (facings[index] === 'left') {
                transitionTo(index, animations.LeftReturn);
                setTimeout(() => {
                    facings[index] = 'viewer';
                    performViewerAction(index);
                }, 300);
            } else {
                performViewerAction(index);
            }
        }

        setTimeout(() => moveFrog(index), Math.random() * 4000 + 4000);
    }

    function performViewerAction(index) {
        const actions = ['Blink', 'Croak', 'Tongue', 'Ribbit', 'FrogLoad.gif', 'TalkMore.gif'];
        const action = getRandomElement(actions);

        if (action === 'Ribbit' || action === 'Tongue') {
            playSound(action);
        }

        if (action === 'FrogLoad.gif' || action === 'TalkMore.gif') {
            const newFrogElement = document.createElement('img');
            newFrogElement.src = action;
            newFrogElement.className = 'frog';
            newFrogElement.onload = () => {
                const oldFrogElement = frogContainers[index].querySelector('.frog');
                if (oldFrogElement) {
                    frogContainers[index].removeChild(oldFrogElement);
                }
                frogContainers[index].appendChild(newFrogElement);
            };
        } else {
            transitionTo(index, animations[action]);
        }
    }

    function jumpFrog(index, pixels, direction) {
        let movedPixels = 0;
        const interval = setInterval(() => {
            if (movedPixels < pixels) {
                const currentLeft = parseInt(frogContainers[index].style.left, 10);
                if (direction === 'right') {
                    frogContainers[index].style.left = `${currentLeft + 1}px`;
                } else {
                    frogContainers[index].style.left = `${currentLeft - 1}px`;
                }
                movedPixels++;
            } else {
                clearInterval(interval);
            }
        }, 10);
    }

    function startTouchDrag(event, container) {
        const touch = event.touches[0];
        const offsetX = touch.clientX - container.offsetLeft;
        const offsetY = touch.clientY - container.offsetTop;

        function touchDrag(event) {
            const touch = event.touches[0];
            container.style.left = `${touch.clientX - offsetX}px`;
            if (verticalDraggingEnabled) {
                container.style.top = `${touch.clientY - offsetY}px`;
            }
        }

        function stopTouchDrag() {
            document.removeEventListener('touchmove', touchDrag);
            document.removeEventListener('touchend', stopTouchDrag);
        }

        document.addEventListener('touchmove', touchDrag);
        document.addEventListener('touchend', stopTouchDrag);
    }

    frogContainers.forEach((container, index) => {
        container.addEventListener('touchstart', (event) => {
            startTouchDrag(event, container);
        });
    });

    window.onload = () => {
        for (let i = 0; i < numberOfFrogs; i++) {
            moveFrog(i);
        }
    };
	
	        document.getElementById('toggleVerticalDragging').addEventListener('click', () => {
            verticalDraggingEnabled = !verticalDraggingEnabled;
            frogContainers.forEach((container, index) => {
                container.style.top = `${verticalPosition}px`;
            });
        });
	
	
	        let lastZoomLevel = window.devicePixelRatio;

        function checkZoomLevel() {
            if (window.devicePixelRatio !== lastZoomLevel) {
                document.getElementById('refreshButton').style.display = 'block';
                lastZoomLevel = window.devicePixelRatio;
            }
        }

        window.addEventListener('resize', checkZoomLevel);


