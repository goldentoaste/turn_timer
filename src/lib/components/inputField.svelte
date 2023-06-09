<script>
    export let value = "";
    export let disabled = false;
    export let placeholder = ">_";

    import { fade, fly } from "svelte/transition";
    let showMsg = false;
    function onClick() {
        console.log("clicke1111d");
        if (disabled && value.length > 0) {
            console.log("clicked");
            navigator.clipboard.writeText(value).then((e) => {
                showMsg = true;
                setTimeout(() => {
                    showMsg = false;
                }, 1000);
            });
        }
    }
</script>


<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="parent" on:click={onClick}>
    <input
        type="text"
        {placeholder}
        bind:value
        {disabled}
        class:clickable={disabled}
        
    />

    {#if showMsg}
        <div
            class="msg"
            in:fly={{
                x: -10,
            }}
            out:fade={{duration:200}}
        >
            Copied!
        </div>
    {/if}
</div>

<style>


.parent {
    align-self: stretch;
    position: relative;
    display: flex;
}
    input {
       
        all: unset;
        border: 2px var(--bg2) solid;
        background-color: var(--bg1);
        color: var(--fg);
        height: auto;
        padding: 0.5rem;
    }

    input::placeholder {
        color: var(--bg3);
    }

    .clickable {
        cursor: pointer;
        transition: filter 0.5s ease-out;
        user-select: none;
    }
    .clickable:hover {
        filter: brightness(1.2);
    }

    .msg {
        background-color: var(--bg3);
        border: 2px solid var(--fg1);

        position: absolute;
        left: calc(100% + 0.5rem);
        top: 50%;
        transform: translate(0,-50%);
        padding: 0.5rem;
    }
</style>
