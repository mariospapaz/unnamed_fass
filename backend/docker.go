package main

import (
	"github.com/go-chi/chi/v5"
	"net/http"
)

// Add Docker lib

func GetDockerVersion(w http.ResponseWriter, r *http.Request) {
	cmd := GetCommandStdout([]string{"docker version | grep Version | head -n1"})
	w.WriteHeader(http.StatusFound)
	APISend(ApiMessage(cmd), w)
}

func GetNetwork(w http.ResponseWriter, r *http.Request) {
	cmd := GetCommandStdout([]string{"docker network ls"})
	w.WriteHeader(http.StatusFound)
	APISend(ApiMessage(cmd), w)
}

func GetNetworkInspect(w http.ResponseWriter, r *http.Request) {
	cmd := GetCommandStdout([]string{"docker network inspect " + chi.URLParam(r, "network_name")})
	w.WriteHeader(http.StatusFound)
	APISend(ApiMessage(cmd), w)
}

func GetDockerImages(w http.ResponseWriter, r *http.Request) {
	cmd := GetCommandStdout([]string{"docker images"})
	w.WriteHeader(http.StatusFound)
	APISend(ApiMessage(cmd), w)
}

func GetDockerImage(w http.ResponseWriter, r *http.Request) {
	pipe := "docker images | grep " + chi.URLParam(r, "image_name")
	cmd := GetCommandStdout([]string{pipe})
	w.WriteHeader(http.StatusFound)
	APISend(ApiMessage(cmd), w)
}

func PullDockerImage(w http.ResponseWriter, r *http.Request) {
	pipe := "docker rmi" + chi.URLParam(r, "image_name")
	cmd := GetCommandStdout([]string{pipe})
	w.WriteHeader(http.StatusFound)

	// Not completely ready
	APISend(ApiMessage(cmd), w)
}
