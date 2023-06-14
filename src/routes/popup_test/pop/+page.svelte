<script>
    import { testVar } from "$lib/stores";
    import { onMount } from "svelte";
    import { get } from "svelte/store";

    let show = false;
let mounted = false
let val = 0;
    onMount(()=>{
mounted = true;
window.opener.varrr.subscribe((newval)=>{
val = newval;
})
    })


</script>

<h1>Poppin</h1>
{#if mounted}
    <p>Value is: {val}</p>
{/if}

<button
    on:click={() => {
        console.log("haha");
        
        if(!window){
            return;
        }
        window.opener.varrr.update((val) => val + 1);
    }}>acasdasas</button
>
