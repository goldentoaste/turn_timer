<script>
    import Button from "$lib/components/Button.svelte";
</script>

<h1>Turn Timer</h1>
<p>
    Host: Click on 'host a game' and in the new page, click on create on room.
    Then send the generated code to other players so they can join. Click on
    "Start Game" when all the players has joined.
</p>
<p>
    Players: Click on "Join a Lobby" then paste the given code to join the
    lobby. Wait for the host to start game.
</p>
<p>
    A popup will show when game starts, containing the timer. Its highly
    recommended to use something like
    <a href="https://www.autohotkey.com/v2/"> AutoHotKey </a>
    with the following code in order to pin the window on top over your game window.
</p>
<pre>
    <code>
    ^space::
        {'{'}
            WinSetAlwaysOnTop -1, "A"
        {'}'}
    </code>
</pre>
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
