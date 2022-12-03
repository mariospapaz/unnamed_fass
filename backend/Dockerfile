FROM golang:alpine3.16 as base

RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid 65532 \
    small-user

WORKDIR /app
USER root
RUN apk add build-base
COPY . .

RUN go mod download
RUN go mod verify

RUN go build -o /main .


FROM docker:rc-cli 
USER root
COPY --from=base /etc/passwd /etc/passwd
COPY --from=base /etc/group /etc/group
COPY --from=base /main .
RUN touch votes.db && chown small-user:small-user votes.db
USER small-user:small-user

EXPOSE 8080

ENTRYPOINT [ "/main" ]
