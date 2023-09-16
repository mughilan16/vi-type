package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"time"
)

func main() {
	mux := http.NewServeMux()
	port := 3000
	addr := fmt.Sprintf(":%d", port)
	// HTML Page
	mux.HandleFunc("/", homeHandler)
	mux.HandleFunc("/result", resultHandler)
	mux.HandleFunc("/logo", logoHandler)
	// APIs
	mux.HandleFunc("/api/randomSentence", randomSentence)
	fmt.Printf("Starting server at port %d\n", port)
	fmt.Printf("http://locahost%s", addr)
	err := http.ListenAndServe(addr, mux)
	if err != nil {
		log.Fatalln(err)
	}
}

type randomSentenceResponse struct {
	ID   int    `json:"id"`
	Text string `json:"text"`
}

func randomSentence(w http.ResponseWriter, r *http.Request) {
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

func resultHandler(w http.ResponseWriter, r *http.Request) {
	filename := "result.gohtml"
	tmpl, err := template.New(filename).ParseFiles(filename)
	if err != nil {
		panic(err)
	}
	err = tmpl.Execute(w, nil)
	if err != nil {
		panic(err)
	}
}

func logoHandler(w http.ResponseWriter, r *http.Request) {
	iconname := "logo.png"
	buf, err := ioutil.ReadFile(iconname)
	if err != nil {
		log.Fatalln(err)
	}
	w.Header().Set("Content-Type", "image/png")
	_, err = w.Write(buf)
	if err != nil {
		log.Fatalln(err)
	}
}
