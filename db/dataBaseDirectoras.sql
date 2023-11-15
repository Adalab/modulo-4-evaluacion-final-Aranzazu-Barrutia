CREATE DATABASE directoras_de_cine;

USE directoras_de_cine;

CREATE TABLE directora(
	idDirectora int auto_increment primary key,
    name_directora varchar (50) not null,
    country varchar (50) not null,
    prize varchar (100) not null
);
CREATE TABLE film(
	idFilm int auto_increment primary key,
    nameFilm varchar(50) not null,
    years int not null,
    genre varchar (50) not null
);
CREATE TABLE users(
	idUsers int auto_increment primary key,
    usersName varchar(100) not null ,
    email varchar(100) not null unique,
    passwords varchar(100)not null,
    fk_directora int,
    constraint fk_directora_user foreign key (fk_directora) references directora(idDirectora),
    fk_film int,
    constraint fk_film_user foreign key (fk_film) references film(idFilm)
    
)
