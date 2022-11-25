FROM bitnami/kubectl:1.24 

USER root 

RUN adduser \
  --disabled-password \
  --gecos "" \
  --home "/nonexistent" \
  --shell "/sbin/nologin" \
  --no-create-home \
  --uid 65532 \
  small-user 

RUN apt-get update && apt-get upgrade -y
RUN apt-get -y install python3 python3-pip 
WORKDIR /app 
COPY . . 
# RUN pip install -r requirements.txt

USER small-user

ENTRYPOINT [ "/bin/bash" ] # switch this to the python program later on
