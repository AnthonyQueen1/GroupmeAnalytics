-- drop table groups;
-- drop table messages;
-- drop table groupwordcount;
-- drop table wordcount;

-- create table commonCase (
--   common_word varchar (255),
--   PRIMARY KEY (common_word)
-- ); 

-- create table groups (
--   group_id INT, 
--   group_name varchar(255),
--   message_count INT,
--   PRIMARY KEY (group_id)
-- );

-- create table messages (
--   group_id INT, 
--   message_id varchar(32),
--   message_length INT,
--   PRIMARY KEY (group_id, message_id)
-- );

-- create table groupwordcount (
--   group_id INT,
--   word varchar(512),
--   count INT,
--   PRIMARY KEY(group_id, word)
-- );


---------------------
CREATE TABLE commonCase (
  common_word VARCHAR (255),
  PRIMARY KEY (common_word)
); 

drop table groupmessages;
drop table groupname;
drop table wordcount;
-- need this one

CREATE TABLE groupmessages (
  group_id INT,
  message_id VARCHAR(32),
  PRIMARY KEY (group_id, message_id)
);

CREATE TABLE groupname (
  group_id INT,
  group_name VARCHAR(255),
  PRIMARY KEY (group_id)
);

CREATE TABLE wordcount (
  message_id VARCHAR(32),
  word VARCHAR(512),
  count INT,
  PRIMARY KEY (message_id, word)
);

-- queries -------------------
-- get counts of all words over all groups
SELECT word, sum(count) AS count
FROM wordcount wc
GROUP BY wc.word
ORDER BY count DESC, word ASC
LIMIT 10;

-- gets all words FROM a specific group
SELECT word, sum(count) AS count
FROM wordcount wc
NATURAL JOIN groupmessages gm 
WHERE group_id = 27894476
GROUP BY word
ORDER BY count DESC, word ASC
LIMIT 10;

-- gets all wordcounts no commonCASe
SELECT wc.word, sum(wc.count) AS count
FROM wordcount wc 
WHERE wc.word NOT IN (
  SELECT common_word FROM commonCase
  )
GROUP BY wc.word
ORDER BY count DESC, word ASC 
LIMIT 100;

-- gets specific group, no commonCase
SELECT wc.word, sum(wc.count) AS count
FROM wordcount wc
NATURAL JOIN groupmessages gm 
WHERE wc.word NOT IN (
  SELECT common_word FROM commonCase
  )
AND gm.group_id = 27894476
GROUP BY wc.word
ORDER BY count DESC, word ASC 
LIMIT 100;

-- gets total word counts
SELECT sum(count) AS count FROM wordcount;

-- gets total messages
SELECT COUNT(*) AS count FROM groupmessages;

-- gets total groups number
SELECT COUNT(*) AS count FROM groupname;

-- gets groups name / id
SELECT * FROM groupname ORDER BY group_name ASC;


--- old queries -------------------

insert into commonCase values ("the"), ("to");
select * from groups limit 100;
select * from groupwordcount limit 100;
select * from wordcount limit 100;

SELECT COUNT(*) AS count FROM groupmessages;

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


---- testing
