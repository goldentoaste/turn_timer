<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import InputField from "$lib/components/inputField.svelte";
    import { players } from "$lib/players";
    import { joinRoom, dataChannels } from "$lib/rtc";
    import { roomId, playerId } from "$lib/stores";

    let playerName = "";

</script>

<div class="hGroup">
    <InputField bind:value={playerName} placeholder="Player name..." />
    <InputField bind:value={$roomId} placeholder="Room id..." />
    <Button
        disabled={($roomId.length == 0 || playerName.length==0) ||
            ($playerId.length > 0 && players[$playerId] !== undefined)}
        on:click={() => {
            joinRoom($roomId, playerName);
        }}
    >
        <span>Join Lobby</span>
    </Button>
</div>

<style>
    .hGroup {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: 1rem;
        gap: 1rem;
    }
</style>
