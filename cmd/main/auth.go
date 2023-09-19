package main

import (
	"context"
	"fmt"
	"net/http"

	"golang.org/x/oauth2"
)

var (
	googleOAuthConfig = oauth2.Config{
		ClientID:     "YOUR_CLIENT_ID",
		ClientSecret: "YOUR_CLIENT_SECERT",
		RedirectURL:  "http://localhost:4000/auth/google/callback",
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email"},
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://accounts.google.com/o/oauth2/auth",
			TokenURL: "https://accounts.google.com/o/oauth2/token",
		},
	}
	oauthStateString = "randomstate"
)

func (app *application) googleLogin(w http.ResponseWriter, r *http.Request) {
	googleOAuthConfig.ClientID = app.config.auth.key
	googleOAuthConfig.ClientSecret = app.config.auth.secret
	url := googleOAuthConfig.AuthCodeURL(oauthStateString)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func (app *application) googleCallback(w http.ResponseWriter, r *http.Request) {
	state := r.FormValue("state")
	if state != oauthStateString {
		app.errorLog.Println("Invalid Oauth state")
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	code := r.FormValue("code")
	token, err := googleOAuthConfig.Exchange(context.Background(), code)
	if err != nil {
		app.errorLog.Printf("Code exchange failed %v\n", err)
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}
	client := googleOAuthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		app.errorLog.Printf("Failed to fetch userinfo: %v\n", err)
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}
	defer resp.Body.Close()
	fmt.Fprintf(w, "Logged in with Google as %s\n", resp.Header.Get("email"))
}
