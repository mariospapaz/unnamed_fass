FROM golang:alpine3.16 as base

RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid 65532 \
    small-user

WORKDIR $GOPATH/deadlines

COPY ./deadlines .

RUN go mod download
RUN go mod verify

USER small-user

RUN CGO_ENABLED=0 go build -o /main ./cmd

ENTRYPOINT [ "/main" ]
