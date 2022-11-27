package main

import (
	"encoding/json"
	"net/http"
	"os/exec"
)

// sends json of format "{"_message": "msg"}"
func ApiMessage(msg string) []byte {
	return []byte(`{ "_message": "` + msg + `"}`)
}

func CheckAPIError(err error, w http.ResponseWriter) bool {
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		w.Write(ApiMessage("Endpoint failed"))
		return false
	}
	return true
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
	if !CheckAPIError(err, w) {
		return
	}
	APISend(file, w)
}

func GetCommandStdout(pipe string, err_msg string) string {
	cmd, err := exec.Command(pipe).Output()
	if err != nil {
		return err_msg
	}
	return string(cmd)
}
