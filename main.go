package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
)

func main() {
	mux := http.NewServeMux()
	port := 3000
	addr := fmt.Sprintf(":%d", port)
	mux.HandleFunc("/", homeHandler)
	err := http.ListenAndServe(addr, mux)
	if err != nil {
		log.Fatalln(err)
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
