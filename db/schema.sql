CREATE TABLE headcount (
	id       SERIAL PRIMARY KEY,
	how_many SMALLINT CHECK (how_many >= 0),
	ts       TIMESTAMP WITH TIME ZONE
);
