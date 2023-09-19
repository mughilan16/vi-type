package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"time"
)

type randomSentenceResponse struct {
	ID   int    `json:"id"`
	Text string `json:"text"`
}

type resultRequest struct {
	SpeedList  []int `json:"speedList"`
	ErrorCount int   `json:"errorCount"`
	TimeTaken  int   `json:"timeTakenInSeconds"`
}

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
	app.renderTemplate(w, nil, "index")
}

func (app *application) resultHandler(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		app.errorLog.Println(err)
		log.Fatalln(err)
		return
	}
	var data resultRequest
	if err := json.Unmarshal(body, &data); err != nil {
		app.errorLog.Println(err)
		log.Fatalln(err)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func (app *application) handleGoogleLogin(w http.ResponseWriter, r *http.Request) {
	app.googleLogin(w, r)
}

func (app *application) handleGoogleCallback(w http.ResponseWriter, r *http.Request) {
	app.googleCallback(w, r)
}
