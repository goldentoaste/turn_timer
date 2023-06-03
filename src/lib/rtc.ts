import { app, db } from "$lib/firebase"
import { addDoc, collection, doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { channelReady, currentConnectionId } from "./stores";
import { get } from "svelte/store";
const connectionConfig: RTCConfiguration = {
    iceServers: [
        {   
            urls: ['stun:stun1.l.google.com:19302', "stun:stun2.l.google.com:19302"]
        }
    ],
    iceCandidatePoolSize: 10
}
let peerConnection: RTCPeerConnection;
let dataChannel: RTCDataChannel;


function initializeRTC() {
    peerConnection = new RTCPeerConnection(connectionConfig);


}


async function connectToSignalServer() {

    const callDoc = await addDoc(collection(db, "calls"), {});
    const offers = collection(callDoc, "offers");
    const anwsers = collection(callDoc, "anwsers");
    currentConnectionId.set(callDoc.id);

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            addDoc(offers, event.candidate.toJSON());
        }
    }

    const offerDesc = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDesc);


    const offer = {
        sdp: offerDesc.sdp,
        type: offerDesc.type
    }

    await setDoc(callDoc, { offer });

    onSnapshot(callDoc, (snap) => {

        const data = snap.data();
        console.log("doc changed", data)
        //!peerConnection.currentRemoteDescription &&
        if (data?.anwser) {
            const anwserDesc = new RTCSessionDescription(data.anwser);
            peerConnection.setRemoteDescription(anwserDesc).catch(e => {
                console.log("Host set remote", e)
            });
        }
    });
    onSnapshot(anwsers, (snap) => {
        snap.docChanges().forEach(change => {
            if (change.type == "added") {
                const candidate = new RTCIceCandidate(change.doc.data())
                peerConnection.addIceCandidate(candidate);
            }
        })
    })
}


async function joinChat(id: string) {


    const callDoc = doc(db, `calls/${id}`);
    const anwsers = collection(callDoc, "anwsers");
    const offers = collection(callDoc, "offers");

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            addDoc(anwsers, event.candidate.toJSON())
        }
    }

    const callData: any = (await getDoc(callDoc)).data();

    const offerDesc = callData.offer;

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offerDesc)).then(
        e => console.log("client set remote")
    )
    const anwserDesc = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(anwserDesc).then(
        e => console.log("client set local")
    )

    const anwser = {
        type: anwserDesc.type,
        sdp: anwserDesc.sdp
    }

    await updateDoc(callDoc, { anwser });

    onSnapshot(offers, snap => {
        snap.docChanges().forEach(change => {

            console.log("client adding new ice", change)
            if (change.type === "added") {
                let data = change.doc.data();
                peerConnection.addIceCandidate(new RTCIceCandidate(data))
            }
        })
    })

}

export { peerConnection, dataChannel, initializeRTC, connectToSignalServer, joinChat };