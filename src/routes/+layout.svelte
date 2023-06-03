<script>
    import initAll from "$lib/init";

 
    import { onMount } from "svelte";

    onMount(() => {
        initAll()
    });
</script>


<slot/>