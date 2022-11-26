<script>

    import Button from './Button.svelte';

</script>

<main>
	<h1>Hello Beta Tester!</h1>
	<p> Please be patient, frontend is last priority is this project.</p>

    <Button buttonType="primary">Login</Button>
    <Button buttonType="primary">Make Demo instance</Button>
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
