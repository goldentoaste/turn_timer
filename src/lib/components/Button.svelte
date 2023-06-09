<script>
    export let style = "";

    let hovering = false;
</script>

<div
    class="buttonRoot"
    on:mouseenter={() => {
        hovering = true;
    }}
    on:mouseleave={()=>{
        hovering = false;
    }}
    on:click
    {style}
    on:keydown
>
    <div class="decor n1" class:hExpand={hovering} />
    <div class="decor n2" class:hExpand={hovering} />
    <div class="decor n3" class:vExpand={hovering} />
    <div class="decor n4" class:vExpand={hovering} />
    <div class="wrapper">
        <slot />
    </div>
</div>

<style>
    .buttonRoot {
        position: relative;
        background-color: var(--bg1);
        user-select: none;
        transition: all 0.4s ease-out;
        cursor: pointer;
    }

    .wrapper {
        position: relative;
        border: var(--bg2) 2px solid;
        padding: 0.5rem;
        transition: filter 0.4s ease-out;
    }

    .wrapper:hover {
        filter: brightness(1.1);
    }
    .buttonRoot:hover {
        background-color: var(--bg2);
        box-shadow: 0px 0px 20px var(--bg3);
        scale: 1.05;
    }

    .decor {
        position: absolute;
        transition-property: width height;
        transition-duration: 0.5s;
        transition-timing-function: ease-out;

        background-color: var(--orange-alt);
        z-index: 1;
    }

    .n1,
    .n2 {
        height: 2px;
        width: 0px;
       
    }
    .n1 {
        top: 0;
        right: 0;
    }
    .n2 {
        bottom: 0;
        left: 0;
    }

    .n3,
    .n4 {
        width: 2px;
        height: 0;

        
    }
    .n3 {
        left: 0;
        top:0
    }

    .n4 {
        right: 0;
        bottom: 0;
    }

    .vExpand {
        height: 100%;
    }

    .hExpand {
        width: 100%;
    }
</style>
