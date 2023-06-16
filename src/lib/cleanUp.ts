import { get } from "svelte/store"
import { isHost, roomId, playerId } from "./stores"
import { deleteDoc, doc } from "firebase/firestore"
import { db } from "./firebase"





async function cleanup() {
    if (get(isHost) && get(roomId)) {
        await deleteDoc(doc(db, `rooms/${get(roomId)}`))
    }
}



export {cleanup}