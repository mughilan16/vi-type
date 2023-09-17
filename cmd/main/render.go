package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

func (app *application) renderTemplate(w http.ResponseWriter, r *http.Request, page string) {
	filename := fmt.Sprintf("%s.gohtml", page)
	cwd, err := os.Getwd()
	if err != nil {
		app.errorLog.Println(err)
		log.Fatal(err)
	}
	templatePath := filepath.Join(cwd, "cmd/main/pages", filename)
	tmpl, err := template.ParseFiles(templatePath)
	if err != nil {
		app.errorLog.Println(err)
		log.Fatalln(err)
	}
	err = tmpl.Execute(w, nil)
	if err != nil {
		app.errorLog.Println(err)
		log.Fatalln(err)
	}
}
