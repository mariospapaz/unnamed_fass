<script lang="ts">

    import { onMount } from "svelte";
    const votes = "http://0.0.0.0:8080/api/get_votes";

    let vote_count = 0;

    onMount(async function () {
        GetVotes();
    });

    let has_voted = false;

    async function GetVotes() {
        const response = await fetch(votes);
        const data = await response.json();
        vote_count = data["votes"];
    }

    function MakeVote() {
        if(!has_voted) {
            const res = fetch(votes, {
                            method: 'POST',
                        });
            
            has_voted = true;
            GetVotes()
        }
    }

</script>

<main>
    <nav class="navbar"> 
       <button type="button" class="btn btn-success">Unnamed FasS</button>
        
       <div class="vote">
        <button type="button" class="btn btn-success" on:click={MakeVote}>Star this Project</button>
        Votes: {vote_count}
       </div>

       <button type="button" class="btn btn-success">Login</button>
    </nav>
	
    <h1>Admin Center</h1>
	<p> Please be patient, frontend is last priority is this project.</p>

    
    <!-- Below button will be moved on another page -->
    <button type="button" class="btn btn-warning">Make Machine</button>
    <div class="container">
        <div class="row">
            <div class="machines">
            </div>
        </div>

        <div class="row">
            <div class="col-sm machine-status">
            </div>
            <div class="col-sm machine-info">
            </div>
        </div>
    </div>

</main>

<style>

    .machines, .machine-status, .machine-info {
        border: 1px solid black;
        border-radius: 10px;
        height: 200px;
        text-align: center;
        background-color: #198754;
    }
        
    .navbar {
        border-radius: 10px;        
        background-color: white;
    }

    .vote { width: 50%;}

    .btn {
        margin-left: 2%;
        margin-right: 1%;
    }

	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
        background-color: #1f2620;
	}

	h1 {
		color: green;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
