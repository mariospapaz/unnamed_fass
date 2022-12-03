package main

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
	"log"
	"net/http"
)

func ConnectDB() {
	sql, err := sql.Open("sqlite3", "votes.db")
	if err != nil {
		log.Println(err)
	}

	defer sql.Close()

	temp := `
    DROP TABLE IF EXISTS VOTES;
    CREATE TABLE VOTES(ID INT(4) NOT NULL, VOTE INT(4) NOT NULL);

    INSERT INTO VOTES(ID, VOTE)
        VALUES(1, 10);
    `
	_, err2 := sql.Exec(temp)
	if err2 != nil {
		log.Println(err2)
	}

}

// Supports this based project, Avoid abusing it :')
func MakeVote(w http.ResponseWriter, r *http.Request) {

	sql, err := sql.Open("sqlite3", "votes.db")
	if err != nil {
		log.Println(err)
	}
	defer sql.Close()

	temp := `
    UPDATE VOTES 
    SET VOTE = VOTE + 1;
    WHERE ID = 1;
    `
	_, err2 := sql.Exec(temp)
	if err2 != nil {
		log.Println(err)
	}
}

// Gets The based people that supported the project
func GetVotes(w http.ResponseWriter, r *http.Request) {
	sql, err := sql.Open("sqlite3", "votes.db")
	if err != nil {
		log.Println("CONNECTION FAILED")
		log.Println(err)
	}
	defer sql.Close()

	rows, err := sql.Query(`SELECT VOTE FROM VOTES WHERE ID = 1;`)
	if err != nil {
		log.Println(err)
	}

	defer rows.Close()

	votes := make(map[string]int)

	for rows.Next() {
		var vote int
		err = rows.Scan(&vote)

		if err != nil {
			log.Println(err)
		}
		votes["votes"] = vote
	}

	RespondWithJSON(votes, w)
}
