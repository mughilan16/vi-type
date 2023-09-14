package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"math/rand"
	"net/http"
	"time"
)

func main() {
	mux := http.NewServeMux()
	port := 3000
	addr := fmt.Sprintf(":%d", port)
	mux.HandleFunc("/", homeHandler)
	mux.HandleFunc("/api/randomSentence", randomSentence)
	err := http.ListenAndServe(addr, mux)
	if err != nil {
		log.Fatalln(err)
	}
}

type randomSentenceResponse struct {
	Text string `json:"text"`
}

func randomSentence(w http.ResponseWriter, r *http.Request) {
	source := rand.NewSource(time.Now().UnixNano())
	randomNum := rand.New(source).Intn(len(sentences))
	data := randomSentenceResponse{
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

func homeHandler(w http.ResponseWriter, r *http.Request) {
	filename := "index.gohtml"
	tmpl, err := template.New(filename).ParseFiles(filename)
	if err != nil {
		panic(err)
	}
	err = tmpl.Execute(w, nil)
	if err != nil {
		panic(err)
	}
}
