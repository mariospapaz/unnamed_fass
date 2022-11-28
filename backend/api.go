package main

import (
	"log"
	"net/http"
	"time"

	chi "github.com/go-chi/chi/v5"
	middleware "github.com/go-chi/chi/v5/middleware"
	cors "github.com/go-chi/cors"
)

// Sets up all necessary settings for the middleware, including CORS policies
func MiddlewareSetup(r *chi.Mux) {
	r.Use(middleware.Heartbeat("/"))
	r.Use(middleware.Logger)
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))
	r.Use(middleware.AllowContentType("application/json"))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "DELETE", "HEAD"},
		AllowedHeaders: []string{
			"User-Agent",
			"Content-Type",
			"Accept",
			"Accept-Encoding",
			"Accept-Language",
			"Cache-Control",
			"Connection",
			"DNT",
			"Host",
			"Origin",
			"Pragma",
			"Referer",
		},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))
}

// It has all endpoints organized in a function
func HandleEndpoints(r *chi.Mux) {

	r.Head("/api", func(w http.ResponseWriter, r *http.Request) {
		w.Write(ApiMessage("I am fine and well."))
	})

	r.Route("/api", func(r chi.Router) {
		// Hardware
		r.Get("/get_server", GetSystem)

		// Docker
		r.Get("/docker/version", GetDockerVersion)
		r.Get("/docker/network", GetNetwork)
		r.Get("/docker/network/inspect/{network_name}", GetNetworkInspect)

		r.Get("/docker/image", GetDockerImages)
		r.Get("/docker/image/{image_name}", GetDockerImage)
		r.Post("/docker/image/{image_name}", PullDockerImage)
		r.Delete("/docker/image/{image_name}", DeleteDockerImage)
		r.Get("/docker/image/inspect/{image_name}", InspectDockerContainer)
	})
}

func main() {
	log.Println("###### Starting FaaS API ######")
	r := chi.NewRouter()
	MiddlewareSetup(r)
	SetupDockerClient()
	HandleEndpoints(r)

	http.ListenAndServe(":8080", r)
}
