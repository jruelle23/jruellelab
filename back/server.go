package main

import (
	"bytes"
	"fmt"
	"log"
	"net/http"
)

func helloHandler(w http.ResponseWriter, _ *http.Request) {
	var buf bytes.Buffer

	// If we write directly to the writer, we won't be able to return a proper error to the
	// use in case of failure.
	_, err := fmt.Fprintln(&buf, "Hello, World!")
	if err != nil {
		log.Printf("Failed to write response: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	_, err = buf.WriteTo(w)
	if err != nil {
		log.Printf("Error writing response code: %v", err)
		return
	}
}

func main() {
	http.HandleFunc("GET /api/hello", helloHandler)

	port := ":8080"
	fmt.Printf("Server is running on http://localhost%s\n", port)

	err := http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
