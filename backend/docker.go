package main

import (
	"net/http"
	"os/exec"
)

func GetDockerVersion(w http.ResponseWriter, r *http.Request) {
	cmd, err := exec.Command("docker version | grep Version | head -n1").Output()
	if !CheckAPIError(err, w) {
		return
	}
	APISend(cmd, w)
}

func GetNetwork(w http.ResponseWriter, r *http.Request) {
	cmd, err := exec.Command("docker network ls").Output()
	if !CheckAPIError(err, w) {
		return
	}
	APISend(cmd, w)
}

func GetNetworkInspect(w http.ResponseWriter, r *http.Request) {
	cmd, err := exec.Command("docker network inspect").Output()
	if !CheckAPIError(err, w) {
		return
	}
	APISend(cmd, w)
}
