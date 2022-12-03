<script lang="ts">

    import { onMount } from "svelte";
    const votes = "http://backend:8080/api/get_votes";

    let vote_count = 0;
    let has_voted = false;

    onMount(async function () {
        GetVotes();
    });


    async function GetVotes() {
        const response = await fetch(votes);
        const data = await response.json();
        vote_count = data["votes"];
    }

    function MakeVote() {
        if(!has_voted) {
            // Yes I know this can be abusable, be patient
            const res = fetch(votes, { method: 'POST',});
            has_voted = true;
            GetVotes();
        }
    }
    
    let server_info = ""
    async function GetServerInfo() {
        const response = await fetch("http://backend:8080/api/get_server");
        const data = await response.json();
        server_info = data
        console.log(data)
    }

    GetServerInfo()

</script>

<main>
    <nav class="navbar"> 
       <button type="button" class="btn btn-warning">Triceratops</button>
        
       <div class="vote">
        <button type="button" class="btn btn-warning" on:click={MakeVote}>Star this Project</button>
        Votes: {vote_count}
       </div>

       <button type="button" class="btn btn-warning">Login</button>
    </nav>
	
    <h1>Admin Center</h1>
	<p> Please be patient, frontend is last priority is this project.</p>

    
    <div class="container">
        <div class="row">
            <div class="machines">
                <p>Operating System: {server_info['Operating System']}</p>
                <p>CPU: {server_info['cpu']} {server_info['arch']}</p>
                <p>Memory total: {server_info['mem_total']}</p>
                <p>Memory free: {server_info['mem_free']}</p>
            </div>
        </div>

        <div class="row">
            <!-- Machine status and info will change pages from 1 to N machines -->
           <div class="col-sm machine-status">
                <p>Uptime:</p>
            </div>
            <div class="col-sm machine-info">
                <p>Network Subnet:</p>
                <p>Network Card:</p>
                <p>Public IP:</p>
                <nav class="navbar">
                    <button type="button" class="btn btn-danger">
                        Shutdown server
                        <i class="bi bi-exclamation-diamond"></i>
                    </button>
                    <button type="button" class="btn btn-warning">
                        Check Logs 
                        <i class="bi bi-radioactive"></i>
                    </button>
                </nav>
            </div>
        </div>
    </div>

    <h1>Test the app by running a Machine!</h1>
    <!-- Below button will be moved on another page -->
    <button type="button" class="btn btn-warning">Make Machine</button>

</main>

<style>

    .machines, .machine-status, .machine-info {
        border: 1px solid black;
        border-radius: 10px;
        height: 200px;
        text-align: center;
        background-color: #198754;
        text-align: left;
        font-family: Roboto Mono;
    }
        
    .navbar {
        border-radius: 10px;        
        background-color: #198754;
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
