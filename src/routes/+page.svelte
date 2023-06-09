<script>
    import Button from "$lib/components/Button.svelte";

</script>
<h1>Turn Timer</h1>

<div class="root">
    <div class="buttonHolder">
        <Button>
            <h2>Host a Game</h2>
        </Button>
        <Button>
            <h2>Join a Lobby</h2>
        </Button>
     
    </div>
</div>

<style>
    .root {
        display: flex;

        justify-content: center;
        align-items: center;
    }

    .buttonHolder {
        display: flex;
        flex-direction: row;
        gap: 2rem;
    }
</style>
