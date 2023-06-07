


import { writable } from "svelte/store";



function deltaStore<T>(initial: { [key: string]: T }) {

    const { set, subscribe, update } = writable(initial)

    let delta: { [key: string]: T } = {}

    return {
        subscribe,
        push: (key: string, val: T) => {
            delta[key] = val;
            update(obj => { return { ...obj, key: val } })
        },
        getDelta: () => {
            let temp = { ...delta }
            delta = {}
            return temp;
        }
    }

}

export default deltaStore;