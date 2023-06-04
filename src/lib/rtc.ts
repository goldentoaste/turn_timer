import { app, db } from "$lib/firebase"
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc } from "firebase/firestore";
import { channelReady, roomId } from "./stores";
import { get } from "svelte/store";
const connectionConfig: RTCConfiguration = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', "stun:stun2.l.google.com:19302"]
        }
    ],
    iceCandidatePoolSize: 10,

}



let connections: { [id: string]: RTCPeerConnection } = {};
let outgoingChannels: RTCDataChannel[] = [];
let incomingChannels: RTCDataChannel[] = [];
let userId = undefined;

async function createRoom() {

    // make a nnew room in firebase, set the id
    const roomDoc = await addDoc(collection(db, "rooms"), {});
    roomId.set(roomDoc.id);

}

// when user created, send others a offer to start new call
// when offer is received, create a new peer connection, set remote to offer, set local to a new anwser, send anwser back
// when anwser is received, set the *existing* peer connection's remote to anwser, and stop here.

// when ever offer and anwser is created, attack the associated ice candidates to the documents
async function joinRoom(id: string) {

    const roomDoc = await doc(db, `rooms/${id}`)
    const users = collection(roomDoc, "users")

    const currentUser = await addDoc(users, {})
    userId = currentUser.id;
    const currentOffers = collection(currentUser, "offers")
    const currentAnwsers = collection(currentUser, "anwsers")

    // make a connection for each existing user

    const userDocs = await getDocs(query(users))

    // give every user an offer, awaiting the resolution
    await Promise.all(
        userDocs.docs.map(async target => {

            // skip the current user
            if (target.id === userId) {
                return;
            }


            const targetOffers = collection(target.ref, `/offers`)
            const connection = new RTCPeerConnection(connectionConfig);


            // update the list of connections
            connections[target.id] = connection;

            // create offer
            const offerDescription = await connection.createOffer();
  
            // send offer to target user
            const offerForTarget = await addDoc(targetOffers, {
                originId: userId,
                sdp: offerDescription.sdp,
                type: offerDescription.type
            })
            // attach ice when ready
            const candidates = collection(offerForTarget, "candidates")
            connection.onicecandidate = event => {
                if (event.candidate) {
                    addDoc(candidates, event.candidate.toJSON())
                }
            }
            await connection.setLocalDescription(offerDescription)



            // FINISH SENDING OFFERS //
        })
    )


    // Behaviour for receiving offer
    onSnapshot(currentOffers, (snap) => {
        // only detect the newly added offers
        snap.docChanges().forEach(change => {
            if (change.type == "added") {

                const data = change.doc.data();
                const targetAnwsers = collection(db, `rooms/${roomId}/users/${data.originId}/anwsers`)
                const connection = new RTCPeerConnection(connectionConfig);
                connections[data.originId] = connection
                // offer should only be given by new players
                connection.setRemoteDescription({
                    sdp: data.sdp,
                    type: data.type
                })

                const offerIceCandidates = collection(change.doc.ref, "candidates");
                // add new ice of the offer
                onSnapshot(offerIceCandidates, (snap) => {
                    snap.docChanges().forEach(change => {
                        connection.addIceCandidate(change.doc.data())
                    })
                })

                const anwser = await connection.createAnswer()
                const anwserDoc = addDoc(targetAnwsers, {
                    sdp:anwser.sdp,
                    type: anwser.type,
                    originId:userId
                })
                // create anwser, make ice for answer
                connection.onicecandidate = (event) => {
                    if (event.candidate) {
                        // addDoc(targetAnwsers,)
                    }
                }
            }
        })
    })




}


async function connectToSignalServer() {

    const callDoc = await addDoc(collection(db, "calls"), {});
    const offers = collection(callDoc, "offers");
    const anwsers = collection(callDoc, "anwsers");


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