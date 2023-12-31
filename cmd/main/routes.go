package main

import (
	"net/http"
)

func (app *application) routes() *http.ServeMux {
	mux := http.NewServeMux()
	// HTML Page
	mux.HandleFunc("/", app.homeHandler)
	mux.HandleFunc("/result", app.resultHandler)
	var fileServer = http.FileServer(http.Dir("./cmd/main/static/"))
	mux.Handle("/static/", http.StripPrefix("/static", fileServer))
	// APIs
	mux.HandleFunc("/api/randomSentence", app.randomSentence)
	return mux
}
