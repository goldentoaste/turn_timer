


import { writable } from "svelte/store";



function deltaStore<T>(initial: { [key: string]: T }) {

    const { set, subscribe, update } = writable(initial)

    let delta: { [key: string]: T } = {}

    return {
        subscribe,
        push: (key: string, val: T) => {
            delta[key] = val;
            update(obj => {
                obj[key] = val; return obj;
            })
        },
        getDelta: () => {
            let temp = { ...delta }
            delta = {}
            return temp;
        },
        pop: (key: string) => {
            update((items) => {
                delete items[key]
                return items;
            })
        },
        searchNPop: (value: object) => {
            update((items) => {
                for (const [key, val] of Object.entries(items)) {
                    if (val == value) {
                        delete items[key]
                    }
                }
                return items
            })
        }
    }
}



export { deltaStore };