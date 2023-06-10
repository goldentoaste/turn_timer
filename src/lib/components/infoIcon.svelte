<script>
    import { fly, fade } from "svelte/transition";
    export let text = "";
    let hovering = false;
  
</script>

<div
    class="infoParent"
    on:mouseenter={() => (hovering = true)}
    on:mouseleave={() => {
        hovering = false;
    }}
    class:hovering
>
    <div class="text">?</div>
    {#if hovering}
        <div
            class="msg"
            in:fly={{
                x: -20,
            }}
            out:fade={{ duration: 200 }}
        >
            {text}
        </div>
    {/if}
</div>

<style>
    .text {
        font-weight: bold;
    }

    .infoParent {
        position: relative;
        width: 2rem;
        height: 2rem;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 2px solid var(--bg2);
        cursor: pointer;
    }

    .msg {
        background-color: var(--bg3);
        border: 2px solid var(--fg1);

        position: absolute;
        left: calc(100% + 1rem);
        top: 50%;
        transform: translate(0, -50%);
        padding: 0.5rem;


        min-width: 400px;
        pointer-events: none;
        
    }

    .hovering {
        border: 2px solid var(--bg3);
    }
</style>
