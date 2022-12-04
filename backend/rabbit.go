package main

import (
	"context"
	"time"

	rabbit "github.com/rabbitmq/amqp091-go"
)

type RabbitClient struct {
	client  *rabbit.Connection
	channel *rabbit.Channel
	queues  []string
}

// Close rabbit client !IMPORTANT DO NOT FORGET IT !
func (r *RabbitClient) Close() {
	r.client.Close()
	r.channel.Close()
}

// Declares Rabbit Queues, if they dont exist they will be created.
func (r *RabbitClient) MakeQueues() {
	for _, channel := range r.queues {
		_, err := r.channel.QueueDeclare(
			channel, // name
			false,   // durable
			false,   // delete when unused
			false,   // exclusive
			false,   // no-wait
			nil,     // arguments
		)
		if err != nil {
			panic(err)
		}
	}
}

// Sends a :msg to a :channel_name with a Higher level
func (r *RabbitClient) Send(channel_name string, msg string) {

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := r.channel.PublishWithContext(ctx,
		"",           // exchange
		channel_name, // routing key
		false,        // mandatory
		false,        // immediate
		rabbit.Publishing{
			ContentType: "text/plain", // todo change that later
			Body:        []byte(msg),
		})

	if err != nil {
		panic(err)
	}
}

// Returns a *RabbitClient, it connects to rabbitmq and sets the channels, connection
func MakeRabbitClient() *RabbitClient {
	conn, err := rabbit.Dial("amqp://guest:guest@rabbitmq:5672/")
	if err != nil {
		panic(err)
	}

	ch, err := conn.Channel()
	if err != nil {
		panic(err)
	}

	client := &RabbitClient{
		client:  conn,
		channel: ch,
		queues:  []string{"logs"},
	}

	client.MakeQueues()

	return client
}
