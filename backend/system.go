package main

import (
	"net/http"
)

func GetSystem(w http.ResponseWriter, r *http.Request) {

	specs := map[string]string{
		"cpu":              GetCommandStdout("cat /proc/cpuinfo | grep 'model name' | uniq", "(CPU Name Not found)"),
		"arch":             GetCommandStdout("uname -m", "(Architecture not found)"),
		"mem_free":         GetCommandStdout("free -h | awk '{print $3}' | sed -n -e '2{p;q}'", "(OS does not have free installed)"),
		"mem_total":        GetCommandStdout("free -h | awk '{print $2}' | sed -n -e '2{p;q}'", "(OS does not have free installed)"),
		"Operating System": "Alpine",
	}

	RespondWithJSON(specs, w)
}
