
<script>
    import { onDestroy } from "svelte";

    import { deleteDoc, doc} from "firebase/firestore";

    import { db } from "$lib/firebase";

    onDestroy(()=>{
      
    })
</script>

<div>
    <slot/>
</div>


<style>
    div {
        padding: 5rem 10rem;
        border: red 2px solid;
        margin: 5rem 5rem;
    }
</style>