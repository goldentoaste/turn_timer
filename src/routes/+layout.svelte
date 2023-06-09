<script>

    import "./global.css";
    import { browser } from "$app/environment";
    import initAll from "$lib/init";

 
    import { onMount,onDestroy } from "svelte";

    onMount(() => {
        initAll()
    });


</script>


<slot/>