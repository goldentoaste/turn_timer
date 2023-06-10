<script>
    export let value = "";
    export let disabled = false;
    export let placeholder = ">_";
    export let suffix = "";
    export let pattern = "";

    import { fade, fly } from "svelte/transition";
    let showMsg = false;
    function onClick() {
        if (disabled && value.length > 0) {
            navigator.clipboard.writeText(value).then((e) => {
                showMsg = true;
                setTimeout(() => {
                    showMsg = false;
                }, 1000);
            });
        }
    }

    let inputField;
    function checkInput(event) {
        if (inputField.checkValidity()) {
            value = inputField.value;
        } else {
            inputField.value = value;
        }
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="parent" on:click={onClick}>
    <input
        type="text"
        {placeholder}
        bind:this={inputField}
        {disabled}
        class:clickable={disabled}
        {pattern}
        on:input={checkInput}
        {value}
    />

    {#if showMsg}
        <div
            class="msg"
            in:fly={{
                x: -10,
            }}
            out:fade={{ duration: 200 }}
        >
            Copied!
        </div>
    {/if}

    <div class="suffix">{suffix}</div>
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
        transform: translate(0, -50%);
        padding: 0.5rem;
    }

    .suffix {
        position: absolute;
        right: 0.25rem;

        z-index: 1;
        top: 50%;

        transform: translate(0, -50%);
        color: var(--bg2);
    }
</style>
