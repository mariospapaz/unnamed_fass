package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os/exec"
)

// sends json of format "{"_message": "msg"}"
func ApiMessage(msg string) []byte {
	return []byte(`{ "_message": "` + msg + `"}`)
}

func CheckAPIError(err error, w http.ResponseWriter) error {
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		w.Write(ApiMessage("Endpoint failed"))
		return err
	}
	return nil
}

// Sends found content in json format
func APISend(file []byte, w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusFound)
	w.Write(file)
}

// Takes a stream and marshales it into json before sending it
func RespondWithJSON(stream any, w http.ResponseWriter) {
	file, err := json.Marshal(stream)
	if CheckAPIError(err, w) != nil {
		return
	}
	APISend(file, w)
}

func GetCommandStdout(pipe []string) string {
	var out, stderr bytes.Buffer
	command := exec.Command("sh", append([]string{"-c"}, pipe...)...)
	command.Stdout = &out
	command.Stderr = &stderr
	if err := command.Run(); err != nil {
		log.Println(err)
	}
	return out.String() + stderr.String()
}
