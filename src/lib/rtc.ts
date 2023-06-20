import { app, db } from "$lib/firebase"
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc } from "firebase/firestore";
import { roomId, isHost, playerId } from "./stores";
import { deltaStore } from "./customStores";
import { get } from "svelte/store";
import { MessageTypes, type Message } from "./types";
import { addPlayer, players } from "./players";
import { dev } from '$app/environment';
class DataChannels {
    channel: RTCDataChannel;

    callbacks: { [key: number]: ((msg: Message) => void) };
    index = 0;
    constructor(channel: RTCDataChannel, userName?: string) {
        this.channel = channel;
        this.callbacks = {};

        if (get(playerId).length > 0) {
            userName = players[get(playerId)].name
        }

        const msg = JSON.stringify({
            type: MessageTypes.PlayerJoined,
            origin: get(playerId),
            content: {
                id: get(playerId),
                name: userName
            }
        });
        channel.onopen = (e) => {

            channel.send(
                msg
            )
        }
        channel.onclose = (e) => {
            console.log("channel closed, removing data channel from delta store");

            dataChannels.searchNPop(this)
        }

        channel.onmessage = (e) => { this.onMessage(e) }

    }


    subscribe(callback: (msg: Message) => void) {
        this.index += 1;
        this.callbacks[this.index] = callback;

    }

    onMessage(e: MessageEvent<any> | any) {
        if (!e.data) return;
        const obj: Message = JSON.parse(e.data);
        console.log("Message:", obj);

        for (const [_, callback] of Object.entries(this.callbacks)) {
            callback(obj);
        }
    }

    send(data: string) {
        this.channel.send(data);
    }
}



const connectionConfig: RTCConfiguration = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', "stun:stun2.l.google.com:19302"]
        }
    ],
    iceCandidatePoolSize: 10,
}


let connections: { [id: string]: RTCPeerConnection } = {};
// let outgoingChannels = deltaStore<RTCDataChannel>({});
let dataChannels = deltaStore<DataChannels>({});
let userId = undefined;

async function createRoom() {

    // make a nnew room in firebase, set the id
    const roomDoc = await addDoc(collection(db, "rooms"), {});
    roomId.set(roomDoc.id);
    isHost.set(true)

}

// when user created, send others a offer to start new call
// when offer is received, create a new peer connection, set remote to offer, set local to a new anwser, send anwser back
// when anwser is received, set the *existing* peer connection's remote to anwser, and stop here.

// when ever offer and anwser is created, attack the associated ice candidates to the documents
async function joinRoom(id: string, userName: string) {

    const roomDoc = doc(db, `rooms/${id}`)

    if (!((await getDoc(roomDoc)).exists())) {
        return "Room does not exist, check if the id is correct."
    }

    const users = collection(roomDoc, "users")

    // check if user id exist in local storage.
    if (!window) {
        console.log("error in RTC.ts, window does not exist in current context");

        return "window does not exist in current context, somehow."
    }

    let currentUser = undefined;


    if (window.localStorage.getItem("userId") == null || dev) {
        currentUser = await addDoc(users, {})
        userId = currentUser.id;
        window.localStorage.setItem("userId", userId)
    }
    else {
        currentUser = doc(users, window.localStorage.getItem("userId"));
        await setDoc(currentUser, {});
        userId = currentUser.id;
    }

    playerId.set(userId);
    addPlayer(get(playerId), userName);


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
            dataChannels.push(target.id, new DataChannels(connection.createDataChannel("messages"), userName))


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
            connection.onicecandidate = async event => {
                if (event.candidate) {
                    await addDoc(candidates, event.candidate.toJSON())
                }
            }
            await connection.setLocalDescription(offerDescription);
            // FINISH SENDING OFFERS //
        })
    )


    // Behaviour for receiving offer
    onSnapshot(currentOffers, async (snap) => {
        // only detect the newly added offers
        await Promise.all(
            snap.docChanges().map(
                async change => {
                    if (change.type == "added") {

                        const data = change.doc.data();
                        const targetAnwsers = collection(db, `rooms/${id}/users/${data.originId}/anwsers`)
                        const connection = new RTCPeerConnection(connectionConfig);
                        connections[data.originId] = connection
                        // offer should only be given by new players
                        connection.setRemoteDescription({
                            sdp: data.sdp,
                            type: data.type
                        })
                        connection.ondatachannel = event => {
                            if (event.channel) {

                                dataChannels.push(data.originId, new DataChannels(event.channel))

                            }
                        }

                        const offerIceCandidates = collection(change.doc.ref, "candidates");
                        // add new ice of the offer
                        onSnapshot(offerIceCandidates, (snap) => {
                            snap.docChanges().forEach(change => {

                                connection.addIceCandidate(change.doc.data())
                            })
                        })

                        const anwser = await connection.createAnswer()
                        const anwserDoc = await addDoc(targetAnwsers, {
                            sdp: anwser.sdp,
                            type: anwser.type,
                            originId: userId
                        })
                        const anwserCandiatesCollection = collection(anwserDoc, "candidates")
                        // create anwser, make ice for answer
                        connection.onicecandidate = async (event) => {
                            if (event.candidate) {
                                await addDoc(anwserCandiatesCollection, event.candidate.toJSON())
                            }
                        }
                        connection.setLocalDescription(anwser)
                    }
                }
            )
        )
    })
    // END OF, receving offer, sending anwser back to offerer


    // Behaviour for receiving an anwser 
    onSnapshot(currentAnwsers, async (snap) => {
        await Promise.all(
            snap.docChanges().map(
                async change => {
                    if (change.type == "added") {
                        const data = change.doc.data();
                        const originId = data.originId;

                        let connection: RTCPeerConnection = undefined;
                        try {
                            connection = connections[originId];
                        }
                        catch (err) {
                            console.log("error in receiving anwser, prob unable to find remote id", err)
                            return;
                        }
                        // local description should already be set.
                        connection.setRemoteDescription({
                            sdp: data.sdp,
                            type: data.type
                        });


                        const candidates = collection(change.doc.ref, "candidates")
                        onSnapshot(candidates, snap => {
                            snap.docChanges().forEach(change => {
                                if (change.type == "added") {
                                    connection.addIceCandidate(change.doc.data())
                                }
                            })
                        })
                    }
                }
            )
        )
    })

    return "nice"

}





export {
    createRoom, joinRoom, dataChannels,
    connections
};