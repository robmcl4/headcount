CREATE TABLE headcount (
	id       SERIAL PRIMARY KEY,
	how_many SMALLINT CHECK (how_many >= 0),
	initials VARCHAR(10) NOT NULL,
	ts       TIMESTAMP
);
