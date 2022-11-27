<script lang="ts">
    let votes = 0;
    let has_voted = false;

    function MakeVote() {
        if(!has_voted) {
            ++votes;
            has_voted = true;
        }
    }

</script>

<main>
    <nav class="navbar"> 
       <button type="button" class="btn btn-success">Unnamed FasS</button>
        
       <div class="vote">
        <button type="button" class="btn btn-success" on:click={MakeVote}>Star this Project</button>
        Votes: {votes}
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
