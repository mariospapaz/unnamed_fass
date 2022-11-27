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

COPY . .

RUN go mod download
RUN go mod verify

RUN CGO_ENABLED=0 go build -o /main .


FROM docker:rc-cli 
USER root 
RUN apk add curl
USER small-user:small

COPY --from=base /etc/passwd /etc/passwd
COPY --from=base /etc/group /etc/group

USER small-user:small-user

COPY --from=base /main .

ENTRYPOINT [ "/main" ]
