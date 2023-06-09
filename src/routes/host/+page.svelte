<script lang="ts">
    import { browser } from "$app/environment";
    import { createRoom, joinRoom, dataChannels, cleanup } from "$lib/rtc";
    import { roomId } from "$lib/stores";

    import { onDestroy, onMount } from "svelte";


    function connect() {
        createRoom().then(() => joinRoom($roomId));
    }

    onDestroy(() => {
        if (browser) cleanup();
    });
</script>



<style>
</style>
