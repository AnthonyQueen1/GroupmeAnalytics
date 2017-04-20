drop table groups;
drop table messages;
drop table groupwordcount;
drop table wordcount;

create table commonCase (
	common_word varchar (255)
); 

create table groups (
	group_id INT, 
	group_name varchar(255),
	message_count INT,
	PRIMARY KEY (group_id)
);

create table messages (
	group_id INT, 
	message_id varchar(32),
	message_length INT,
	PRIMARY KEY (group_id, message_id)
);

create table groupwordcount (
	group_id INT,
	word varchar(512),
	count INT,
	PRIMARY KEY(group_id, word)
);

create table wordcount (
	word varchar(512),
	count int,
	PRIMARY KEY(word)
);

select * from groups limit 100;
select * from groupwordcount limit 100;
select * from wordcount limit 100;

insert Groups values(123,"Cats",456,14);
insert into Groups set ? 

select * from groupwordcount where group_id = 1 order by count desc limit 100;

# get top words while removing common words
SELECT wc.word, wc.count
FROM wordcount wc LEFT JOIN commonCase cc
ON wc.word = cc.common_word
WHERE cc.common_word IS NULL
ORDER BY wc.count DESC LIMIT 10;

# get top words by group while removing common words
SELECT gwc.word, gwc.count, gwc.group_id
FROM groupwordcount gwc 
LEFT JOIN commonCase cc
ON gwc.word = cc.common_word
WHERE cc.common_word IS NULL AND gwc.group_id = 1
ORDER BY gwc.count DESC LIMIT 10;