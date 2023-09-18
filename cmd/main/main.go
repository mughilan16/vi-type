package main

import (
	"flag"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type config struct {
	port int
	env  string
	db   struct {
		dsn string
	}
	auth struct {
		key    string
		secret string
	}
}

type application struct {
	config        config
	infoLog       *log.Logger
	errorLog      *log.Logger
	templateCache map[string]*template.Template
}

func (app *application) serve() error {
	srv := http.Server{
		Addr:              fmt.Sprintf(":%d", app.config.port),
		Handler:           app.routes(),
		IdleTimeout:       30 * time.Second,
		ReadTimeout:       10 * time.Second,
		ReadHeaderTimeout: 5 * time.Second,
		WriteTimeout:      5 * time.Second,
	}
	app.infoLog.Printf("Server is listening on port %d in %s", app.config.port, app.config.env)
	return srv.ListenAndServe()
}

func createApp() (*application, error) {
	var cfg config
	flag.IntVar(&cfg.port, "port", 4000, "Server to listen on")
	flag.StringVar(&cfg.env, "env", "development", "app env {production||development}")
	flag.Parse()

	infoLog := log.New(os.Stdout, "INFO\t", log.Ldate|log.Ltime)
	errorLog := log.New(os.Stdout, "ERROR\t", log.Ldate|log.Ltime|log.Lshortfile)

	err := godotenv.Load()
	if err != nil {
		log.Fatal(err)
		errorLog.Fatal(err)
		return nil, err
	}
	tc := make(map[string]*template.Template)
	cfg.auth.key = os.Getenv("GOOGLE_CLIENT_KEY")
	cfg.auth.secret = os.Getenv("GOOGLE_CLIENT_SECRET")

	return &application{
		config:        cfg,
		infoLog:       infoLog,
		errorLog:      errorLog,
		templateCache: tc,
	}, nil
}

func main() {
	app, err := createApp()
	if err != nil {
		return
	}
	app.connectDB()
	err = app.serve()
	if err != nil {
		app.errorLog.Println(err)
		log.Fatalln(err)
	}
}
