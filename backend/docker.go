package main

import (
	"context"
	"net/http"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/go-chi/chi/v5"
)

// Make a DockerClient struct and sets it up
func MakeDockerClient(rmq *RabbitClient) *DockerClient {
	dc := &DockerClient{
		rabbit: rmq,
	}
	dc.SetupDockerClient()
	return dc
}

type DockerClient struct {
	client *client.Client
	rabbit *RabbitClient
}

// Loads Docker ClI, it will fail if docker is not installed
func (d *DockerClient) SetupDockerClient() {
	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		d.rabbit.Send("logs", err.Error())
		return
	}
	d.client = cli
}

// Returns Docker version installed in the server
func (d *DockerClient) GetDockerVersion(w http.ResponseWriter, r *http.Request) {
	// Cant find in documentation the getter
	cmd := GetCommandStdout([]string{"docker version | grep Version | head -n1"})
	w.WriteHeader(http.StatusFound)
	APISend(ApiMessage(cmd), w)
}

// Retuns tons of info related to the docker server, networks, images, version etc
func (d *DockerClient) GetDockerInfo(w http.ResponseWriter, r *http.Request) {
	msg, err := d.client.Info(context.Background())
	if err != nil {
		d.rabbit.Send("logs", err.Error())
		return
	}
	RespondWithJSON(msg, w)
}

// Returns all network cards on the server
func (d *DockerClient) GetNetwork(w http.ResponseWriter, r *http.Request) {
	networks, err := d.client.NetworkList(context.Background(), types.NetworkListOptions{})
	if err != nil {
		d.rabbit.Send("logs", err.Error())
		w.WriteHeader(http.StatusNotFound)
		return
	}
	RespondWithJSON(networks, w)
}

// Returns a specific network card
func (d *DockerClient) GetNetworkInspect(w http.ResponseWriter, r *http.Request) {
	network, err := d.client.NetworkInspect(context.Background(), chi.URLParam(r, "network_name"), types.NetworkInspectOptions{})
	if err != nil {
		d.rabbit.Send("logs", err.Error())
		w.WriteHeader(http.StatusNotFound)
		return
	}
	RespondWithJSON(network, w)
}

// Returns all installed docker images into the server
func (d *DockerClient) GetDockerImages(w http.ResponseWriter, r *http.Request) {
	images, err := d.client.ImageList(context.Background(), types.ImageListOptions{})
	if err != nil {
		d.rabbit.Send("logs", err.Error())
		w.WriteHeader(http.StatusNotFound)
		return
	}
	RespondWithJSON(images, w)
}

// Returns a map of running containers. (containerID = containerImage)
func (d *DockerClient) GetRunningContainers(w http.ResponseWriter, r *http.Request) {
	images := make(map[string]string)
	containers, err := d.client.ContainerList(context.Background(), types.ContainerListOptions{})
	if err != nil {
		d.rabbit.Send("logs", err.Error())
		w.WriteHeader(http.StatusNotFound)
		return
	}
	for _, container := range containers {
		images[container.ID[:10]] = container.Image
	}
	RespondWithJSON(images, w)
}

// Returns a installed image based on id
func (d *DockerClient) GetDockerImage(w http.ResponseWriter, r *http.Request) {
	// Not sure how to use it on postman
	image, err := d.client.ImageSearch(context.Background(), chi.URLParam(r, "image_name"), types.ImageSearchOptions{})
	if err != nil {
		d.rabbit.Send("logs", err.Error())
		w.WriteHeader(http.StatusNotFound)
		return
	}
	RespondWithJSON(image, w)
}

// Downloads docker images, avoid abusing it.
func (d *DockerClient) PullDockerImage(w http.ResponseWriter, r *http.Request) {
	image, err := d.client.ImagePull(context.Background(), chi.URLParam(r, "image_name"), types.ImagePullOptions{})
	if err != nil {
		d.rabbit.Send("logs", err.Error())
		w.WriteHeader(http.StatusNotFound)
		return
	}
	RespondWithJSON(image, w)
}

// Removes docker image
func (d *DockerClient) DeleteDockerImage(w http.ResponseWriter, r *http.Request) {
	image, err := d.client.ImageRemove(context.Background(), chi.URLParam(r, "image_name"), types.ImageRemoveOptions{})
	if err != nil {
		d.rabbit.Send("logs", err.Error())
		w.WriteHeader(http.StatusNotFound)
		return
	}
	RespondWithJSON(image, w)
}

// Inspects container ( must pass container ID or container Name )
func (d *DockerClient) InspectDockerContainer(w http.ResponseWriter, r *http.Request) {
	image, err := d.client.ContainerInspect(context.Background(), chi.URLParam(r, "image_name"))
	if err != nil {
		d.rabbit.Send("logs", err.Error())
		w.WriteHeader(http.StatusNotFound)
		return
	}
	RespondWithJSON(image, w)
}

// Gets Container docs ( must pass container ID or container name )
func (d *DockerClient) GetContainerLogs(w http.ResponseWriter, r *http.Request) {
	image, err := d.client.ContainerLogs(context.Background(), chi.URLParam(r, "image_name"), types.ContainerLogsOptions{})
	if err != nil {
		d.rabbit.Send("logs", err.Error())
		w.WriteHeader(http.StatusNotFound)
		return
	}
	RespondWithJSON(image, w)
}

func (d *DockerClient) StartContainer(w http.ResponseWriter, r *http.Request) {
	err := d.client.ContainerStart(context.Background(), chi.URLParam(r, "image_name"), types.ContainerStartOptions{})
	if err != nil {
		d.rabbit.Send("logs", err.Error())
		w.WriteHeader(http.StatusNotFound)
		return
	}
	RespondWithJSON(ApiMessage("Started container "+chi.URLParam(r, "image_name")), w)
}
func (d *DockerClient) StopContainer(w http.ResponseWriter, r *http.Request) {
	timeout := time.Minute * 5
	err := d.client.ContainerStop(context.Background(), chi.URLParam(r, "image_name"), &timeout)
	if err != nil {
		d.rabbit.Send("logs", err.Error())
		w.WriteHeader(http.StatusNotFound)
		return
	}
	RespondWithJSON(ApiMessage("Started container "+chi.URLParam(r, "image_name")), w)
}

func (d *DockerClient) ContainerRemove(w http.ResponseWriter, r *http.Request) {
	err := d.client.ContainerRemove(context.Background(), chi.URLParam(r, "image_name"), types.ContainerRemoveOptions{})
	if err != nil {
		d.rabbit.Send("logs", err.Error())
		w.WriteHeader(http.StatusNotFound)
		return
	}
	RespondWithJSON(ApiMessage("Removed container "+chi.URLParam(r, "image_name")), w)
}

func (d *DockerClient) ContainerStats(w http.ResponseWriter, r *http.Request) {
	image, err := d.client.ContainerStats(context.Background(), chi.URLParam(r, "image_name"), false)
	if err != nil {
		d.rabbit.Send("logs", err.Error())
		w.WriteHeader(http.StatusNotFound)
		return
	}
	RespondWithJSON(image, w)
}
