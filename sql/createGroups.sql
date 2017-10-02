---------------------
CREATE TABLE commoncase (
  common_word VARCHAR (255),
  PRIMARY KEY (common_word)
); 

-- tables
drop table groupmessages;
drop table groupname;
drop table wordcount;

CREATE TABLE groupmessages (
  group_id INT,
  message_id VARCHAR(32),
  likes INT,
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

-- gets all wordcounts no commoncase
SELECT wc.word, sum(wc.count) AS count
FROM wordcount wc 
WHERE wc.word NOT IN (
  SELECT common_word FROM commoncase
  )
GROUP BY wc.word
ORDER BY count DESC, word ASC 
LIMIT 100;

-- gets specific group, no commoncase
SELECT wc.word, sum(wc.count) AS count
FROM wordcount wc
NATURAL JOIN groupmessages gm 
WHERE wc.word NOT IN (
  SELECT common_word FROM commoncase
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

