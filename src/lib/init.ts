

import { initializeFB } from "./firebase";
import { initializeRTC } from "./rtc";
import { comReady } from "./stores";


function initAll(){


    initializeFB()
    initializeRTC()
    comReady.set(true)
}

export default initAll;