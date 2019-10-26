"use strict";
/*
 Copyright (C) 2012-2016 Grant Galitz

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// HTML Gamepad API support
// Poll for gamepad input about ~4 times per gameboy advance frame (~240 times second)
const GAMEPAD_POLLING_INTERVAL = 1000 / 60 / 4;
const GAMEPAD_KEYMAP_STANDARD_STR = "standard"
// GBA Core key mapping
const GBA_A      = 0
const GBA_B      = 1
const GBA_R      = 8
const GBA_L      = 9
const GBA_SELECT = 2
const GBA_START  = 3
const GBA_LEFT   = 4
const GBA_RIGHT  = 5
const GBA_UP     = 6
const GBA_DOWN   = 7

// When gamepad.mapping reports "standard"
const GAMEPAD_KEYMAP_STANDARD = [
            {gba_key: GBA_B,      gp_button: 0,  type: "button"},
            {gba_key: GBA_A,      gp_button: 1,  type: "button"},
            {gba_key: GBA_L,      gp_button: 4,  type: "button"},
            {gba_key: GBA_R,      gp_button: 5,  type: "button"},
            {gba_key: GBA_SELECT, gp_button: 8,  type: "button"},
            {gba_key: GBA_START,  gp_button: 9,  type: "button"},
            {gba_key: GBA_UP,     gp_button: 12, type: "button"},
            {gba_key: GBA_DOWN,   gp_button: 13, type: "button"},
            {gba_key: GBA_RIGHT,   gp_button: 14, type: "button"},
            {gba_key: GBA_LEFT,  gp_button: 15, type: "button"}
            ];

const GAMEPAD_KEYMAP_DEFAULT = [
            {gba_key: GBA_A,      gp_button: 0, type: "button"},
            {gba_key: GBA_B,      gp_button: 1, type: "button"},
            {gba_key: GBA_L,      gp_button: 4,  type: "button"},
            {gba_key: GBA_R,      gp_button: 5,  type: "button"},
            {gba_key: GBA_SELECT, gp_button: 2, type: "button"},
            {gba_key: GBA_START,  gp_button: 3, type: "button"},
            {gba_key: GBA_UP,     gp_button: 2, type: "axis"},
            {gba_key: GBA_DOWN,   gp_button: 3, type: "axis"},
            {gba_key: GBA_RIGHT,  gp_button: 0, type: "axis"},
            {gba_key: GBA_LEFT,   gp_button: 1, type: "axis"}
            ];

function keyDown(e) {
    var keyCode = e.keyCode | 0;
    for (var keyMapIndex = 0; (keyMapIndex | 0) < 10; keyMapIndex = ((keyMapIndex | 0) + 1) | 0) {
        if ((IodineGUI.defaults.keyZonesGBA[keyMapIndex | 0] | 0) == (keyCode | 0)) {
            IodineGUI.Iodine.keyDown(keyMapIndex | 0);
            if (e.preventDefault) {
                e.preventDefault();
            }
            return;
        }
    }
}
function keyUpGBA(keyCode) {
    keyCode = keyCode | 0;
    for (var keyMapIndex = 0; (keyMapIndex | 0) < 10; keyMapIndex = ((keyMapIndex | 0) + 1) | 0) {
        if ((IodineGUI.defaults.keyZonesGBA[keyMapIndex | 0] | 0) == (keyCode | 0)) {
            IodineGUI.Iodine.keyUp(keyMapIndex | 0);
            return;
        }
    }
}
function keyUp(keyCode) {
    keyCode = keyCode | 0;
    for (var keyMapIndex = 0; (keyMapIndex | 0) < 8; keyMapIndex = ((keyMapIndex | 0) + 1) | 0) {
        if ((IodineGUI.defaults.keyZonesControl[keyMapIndex | 0] | 0) == (keyCode | 0)) {
            keyboardEmulatorControl(keyMapIndex | 0);
            return true;
        }
    }
    return false;
}
function keyUpPreprocess(e) {
    var keyCode = e.keyCode | 0;
    //If we're not mapping a key:
    if (!IodineGUI.toMap) {
        //Check for emulator binding:
        if (!keyUp(keyCode | 0)) {
            //Check for GBA binding:
            keyUpGBA(keyCode);
        }
    }
    else {
        //Map a key binding:
        IodineGUI.toMap[IodineGUI.toMapIndice | 0] = keyCode | 0;
        IodineGUI.toMap = null;
        saveKeyBindings();
    }
}
function keyboardEmulatorControl(keyCode) {
    keyCode = keyCode | 0;
    switch (keyCode | 0) {
        case 0:
            stepVolume(-0.04);
            break;
        case 1:
            stepVolume(0.04);
            break;
        case 2:
            IodineGUI.Iodine.incrementSpeed(0.05);
            break;
        case 3:
            IodineGUI.Iodine.incrementSpeed(-0.05);
            break;
        case 4:
            IodineGUI.Iodine.setSpeed(1);
            break;
        case 5:
            toggleFullScreen();
            break;
        case 6:
            togglePlayState();
            break;
        case 7:
            IodineGUI.Iodine.restart();
    }
}
function toggleFullScreen() {
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
            else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
            else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            }
            else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
    }
    else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}
function togglePlayState() {
    if (IodineGUI.isPlaying) {
        IodineGUI.Iodine.pause();
    }
    else {
        IodineGUI.Iodine.play();
    }
}


// HTML Gamepad API Support

// Load a key map for gamepad-to-gameboy buttons
function gamepadBindKeys(strMapping) {

    // Try to use the w3c "standard" gamepad mapping if available
    // (Chrome/V8 seems to do that better than Firefox)
    //
    // Otherwise use a default mapping that assigns
    // A/B/Select/Start to the first four buttons,
    // and U/D/L/R to the first two axes.

    if (strMapping === GAMEPAD_KEYMAP_STANDARD_STR)
        IodineGUI.gamepad.keybinds = GAMEPAD_KEYMAP_STANDARD;
    else
        IodineGUI.gamepad.keybinds = GAMEPAD_KEYMAP_DEFAULT;
}


function gamepadCacheValues(gamepad, IOgp) {

    // Read Buttons
    for(let k=0; k<gamepad.buttons.length; k++) {
        // .value is for analog, .pressed is for boolean buttons
        IOgp.buttons.cur[k] = (gamepad.buttons[k].value > 0 ||
                             gamepad.buttons[k].pressed == true);

        // Update state changed if not on first input pass
        if (IOgp.buttons.last !== undefined)
            IOgp.buttons.changed[k] = (IOgp.buttons.cur[k] != IOgp.buttons.last[k]);
    }

    // Read Axes
    for(let k=0; k<gamepad.axes.length; k++) {
        // Decode each dpad axis into two buttons, one for each direction
        IOgp.axes.cur[(k*2)  ] = (gamepad.axes[k] < 0);
        IOgp.axes.cur[(k*2)+1] = (gamepad.axes[k] > 0);

        // Update state changed if not on first input pass
        if (IOgp.axes.last !== undefined) {
            IOgp.axes.changed[(k*2)  ] = (IOgp.axes.cur[(k*2)  ] != IOgp.axes.last[(k*2)  ]);
            IOgp.axes.changed[(k*2)+1] = (IOgp.axes.cur[(k*2)+1] != IOgp.axes.last[(k*2)+1]);
        }
    }

    // Save current state for comparison on next input
    IOgp.axes.last = IOgp.axes.cur.slice(0);
    IOgp.buttons.last = IOgp.buttons.cur.slice(0);
}


function gamepadHandleButton(keyBind) {

    var buttonCache;

    // Select button / axis cache based on key bind type
    if (keyBind.type === "button")
        buttonCache = IodineGUI.gamepad.buttons;
    else if (keyBind.type === "axis")
        buttonCache = IodineGUI.gamepad.axes;

    // Make sure the button exists in the cache array
    if (keyBind.gp_button < buttonCache.changed.length) {

        // Send the button state if it's changed
        if (buttonCache.changed[keyBind.gp_button]) {
            if (buttonCache.cur[keyBind.gp_button])
                IodineGUI.Iodine.keyDown(keyBind.gba_key);
            else
                IodineGUI.Iodine.keyUp(keyBind.gba_key);
        }
    }
}


function gamepadGetCurrent() {

    // Chrome requires retrieving a new gamepad object
    // every time button state is queried (the existing object
    // will have stale button state). Just do that for all browsers
    var gamepad = navigator.getGamepads()[IodineGUI.gamepad.apiID];

    if (gamepad)
        if (gamepad.connected)
            return gamepad;

    return undefined;
}


function gamepadUpdate() {

    var gamepad = gamepadGetCurrent();

    if (gamepad !== undefined) {

        // Cache gamepad input values
        gamepadCacheValues(gamepad, IodineGUI.gamepad);

        // Loop through buttons and send changes if needed
        for (let i=0; i<IodineGUI.gamepad.keybinds.length; i++)
            gamepadHandleButton(IodineGUI.gamepad.keybinds[i]);
    }
    else {
        // Gamepad is no longer present, disconnect
        gamepadStop();
    }
}


function gamepadStart(event) {

    var gamepad = navigator.getGamepads()[event.gamepad.index];

    // Make sure it has enough buttons and axes
    if ((gamepad.mapping === GAMEPAD_KEYMAP_STANDARD_STR) ||
        ((gamepad.axes.length >= 2) && (gamepad.buttons.length >= 4))) {

        // Save API index for polling (required by Chrome/V8)
        IodineGUI.gamepad.apiID   = gamepad.index;

        // Assign GBA keys to the gamepad
        gamepadBindKeys(gamepad.mapping);

        // Start polling the gamepad for input
        IodineGUI.gamepad.timerID = setInterval( () => gamepadUpdate(), GAMEPAD_POLLING_INTERVAL);
    }
}


function gamepadStop() {

    // Stop polling the gamepad for input
    if (IodineGUI.gamepad.timerID !== undefined)
        clearInterval(IodineGUI.gamepad.timerID);

    // Clear previous button history and controller info
    IodineGUI.gamepad.axes.last = undefined;
    IodineGUI.gamepad.buttons.last = undefined;
    IodineGUI.gamepad.keybinds = undefined;

    IodineGUI.gamepad.apiID = undefined;
}


