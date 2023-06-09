<script>
    export let style = "";

    let hovering = false;
</script>

<div class="buttonRoot" on:click {style} on:keydown>
    <div class="decor n1" class:hExpand={hovering}/>
    <div class="decor n2" class:hExpand={hovering}/>
    <div class="decor n3" class:vExpand={hovering}/>
    <div class="decor n4" class:vExpand={hovering}/>
    <div class="wrapper">
        <slot />
    </div>
</div>

<style>



    .buttonRoot {
        position: relative;
        background-color: var(--bg1);
        user-select: none;
        transition: all 0.2s ease-out;
    }

    .wrapper {
        border: var(--fg1) 2px solid;
        padding: 0.5rem;
        transition: filter 0.2s ease-out;
    }

    .wrapper:hover{
        filter:brightness(1.1);
    }
    .buttonRoot:hover {
        background-color: var(--bg2);
        box-shadow: 0px 0px 50px var(--bg3);
        scale: 1.05;
    }


    .decor {
        position: absolute;
        transition-property: width height;
        transition-duration: 0.2s;
        transition-timing-function: ease-out;

        background-color: var(--orange-alt);
    }

    .n1,
    .n2 {
        height: 2px;
        width: 0px;
        left: 0;
    }
    .n1 {
        top: 0;
    }
    .n2 {
        bottom: 0;
    }

    .n3,
    .n4 {
        width: 2px;
        height: 0;

        top: 0;
    }
    .n3 {
        left: 0;
    }

    .n4 {
        right: 0;
    }

    .vExpand {
        height: 100%;
    }

    .hExpand {
        width: 100%;
    }
</style>
