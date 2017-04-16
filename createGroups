drop table groups;
drop table groupwordcount;
drop table wordcount;

create table groups (
	group_id INT, 
	group_name varchar(255),
	message_id varchar(32),
	message_length INT,
	PRIMARY KEY (group_id, message_id)
);

create table groupwordcount (
	group_id INT,
	word varchar(255),
	count INT,
	PRIMARY KEY(group_id, word)
);

create table wordcount (
	word varchar(255),
	count int,
	PRIMARY KEY(word)
);

select * from groups limit 100;
select * from groupwordcount limit 100;
select * from wordcount limit 100;

insert Groups values(123,"Cats",456,14);
insert into Groups set ? 

select * from groupwordcount where group_id = 1 order by count desc limit 100;