import pika
import os


def main():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host="localhost")
    )
    channel: pika.BlockingChannel = connection.channel()

    channel.queue_declare(queue="logs")

    def callback(ch, method, properties, body) -> None:
        print(" [x] Received %r" % body)

    channel.basic_consume(
        queue="logs", on_message_callback=callback, auto_ack=True
    )

    print(" [*] Waiting for messages. To exit press CTRL+C")
    channel.start_consuming()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("Interrupted")
        os._exit(0)
