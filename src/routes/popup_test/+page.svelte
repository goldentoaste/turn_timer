


<script>
    import { testVar } from "$lib/stores";

    


    function open(){
        window.varrr = testVar;
        window.open("popup_test/pop","poppin", `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
width=0,height=0,left=-1000,top=-1000`)
    }


</script>



<h1>The test variable is {$testVar}</h1>
<button on:click={open}> open pop up</button>

<button on:click={()=>$testVar += 1}>Go up</button>