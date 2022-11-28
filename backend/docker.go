package main

import (
	"context"
	"log"
	"net/http"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/go-chi/chi/v5"
)

var Dc *client.Client

// Setups a 'singleton' of a temporary global Dc (Dc = Docker Client)
// Do not run the function more than once.
func SetupDockerClient() {
	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		log.Println(err)
	}
	Dc = cli
}

// Returns Docker version installed in the server
func GetDockerVersion(w http.ResponseWriter, r *http.Request) {
	// Cant find in documentation the getter
	cmd := GetCommandStdout([]string{"docker version | grep Version | head -n1"})
	w.WriteHeader(http.StatusFound)
	APISend(ApiMessage(cmd), w)
}

// Retuns tons of info related to the docker server, networks, images, version etc
func GetDockerInfo(w http.ResponseWriter, r *http.Request) {
	msg, err := Dc.Info(context.Background())
	if err != nil {
		log.Println(err)
		return
	}
	RespondWithJSON(msg, w)
}

// Returns all network cards on the server
func GetNetwork(w http.ResponseWriter, r *http.Request) {
	networks, err := Dc.NetworkList(context.Background(), types.NetworkListOptions{})
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	RespondWithJSON(networks, w)
}

// Returns a specific network card
func GetNetworkInspect(w http.ResponseWriter, r *http.Request) {
	network, err := Dc.NetworkInspect(context.Background(), chi.URLParam(r, "network_name"), types.NetworkInspectOptions{})
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	RespondWithJSON(network, w)
}

// Returns all installed docker images into the server
func GetDockerImages(w http.ResponseWriter, r *http.Request) {
	images, err := Dc.ImageList(context.Background(), types.ImageListOptions{})
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	RespondWithJSON(images, w)
}

// Returns a map of running containers. (containerID = containerImage)
func GetRunningContainers(w http.ResponseWriter, r *http.Request) {
	images := make(map[string]string)

	containers, err := Dc.ContainerList(context.Background(), types.ContainerListOptions{})
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	for _, container := range containers {
		images[container.ID[:10]] = container.Image
	}
	RespondWithJSON(images, w)
}

// Returns a installed image based on id
func GetDockerImage(w http.ResponseWriter, r *http.Request) {
	// Not sure how to use it on postman
	image, err := Dc.ImageSearch(context.Background(), chi.URLParam(r, "image_name"), types.ImageSearchOptions{})
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	RespondWithJSON(image, w)
}

// Downloads docker images, avoid abusing it.
func PullDockerImage(w http.ResponseWriter, r *http.Request) {
	image, err := Dc.ImagePull(context.Background(), chi.URLParam(r, "image_name"), types.ImagePullOptions{})
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	RespondWithJSON(image, w)
}

// Removes docker image
func DeleteDockerImage(w http.ResponseWriter, r *http.Request) {
	image, err := Dc.ImageRemove(context.Background(), chi.URLParam(r, "image_name"), types.ImageRemoveOptions{})
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	RespondWithJSON(image, w)
}

// Inspects container ( must pass container ID or container Name )
func InspectDockerContainer(w http.ResponseWriter, r *http.Request) {
	image, err := Dc.ContainerInspect(context.Background(), chi.URLParam(r, "image_name"))
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	RespondWithJSON(image, w)
}
