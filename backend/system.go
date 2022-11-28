package main

import (
	"net/http"
)

func GetSystem(w http.ResponseWriter, r *http.Request) {

	// get_cpu pipe is not working
	get_cpu := []string{"cat /proc/cpuinfo | grep 'model name' | uniq"}

	get_arch := []string{"uname", "-m"}

	get_free_mem := []string{"free -h | awk '{print $3}' | sed -n -e '2{p;q}'"}

	get_total_mem := []string{"free -h | awk '{print $2}' | sed -n -e '2{p;q}'"}

	specs := map[string]string{
		"cpu":              GetCommandStdout(get_cpu),
		"arch":             GetCommandStdout(get_arch),
		"mem_free":         GetCommandStdout(get_free_mem),
		"mem_total":        GetCommandStdout(get_total_mem),
		"Operating System": "Alpine",
	}

	RespondWithJSON(specs, w)
}
