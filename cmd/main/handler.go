package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"time"
)

func (app *application) randomSentence(w http.ResponseWriter, r *http.Request) {
	source := rand.NewSource(time.Now().UnixNano())
	randomNum := rand.New(source).Intn(len(sentences))
	data := randomSentenceResponse{
		ID:   randomNum,
		Text: sentences[randomNum],
	}
	w.Header().Set("Content-Type", "application/json")
	response, err := json.Marshal(data)
	if err != nil {
		log.Fatalln(err)
		return
	}
	w.WriteHeader(http.StatusOK)
	_, err = w.Write(response)
	if err != nil {
		return
	}
}

func (app *application) homeHandler(w http.ResponseWriter, r *http.Request) {
	app.renderTemplate(w, r, "index")
}

func (app *application) resultHandler(w http.ResponseWriter, r *http.Request) {
	app.renderTemplate(w, r, "result")
}
