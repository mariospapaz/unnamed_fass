<script>
    import Button, { Label } from '@smui/button';
    let a = 0;
    let b = 0;
</script>

<main>
	<h1>Hello Beta Tester!</h1>
	<p> Please be patient, frontend is last priority is this project.</p>

    <Button on:click={() => a++} variant="raised">
        <Label>Login</Label>
    </Button>

    <Button on:click={() => b++} variant="raised">
        <Label>Open Demo instance</Label>
    </Button>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
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
