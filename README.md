This is little_television project.
CREATE TABLE history(  
    user_id VARCHAR(255) NOT NULL COMMENT 'user_id',
    history_data VARCHAR(255) COMMENT 'history_data',
    PRIMARY KEY(user_id, history_data)
);
CREATE TABLE user(  
    user_id VARCHAR(255) NOT NULL COMMENT 'user_id',
    password VARCHAR(255) COMMENT 'password',
    PRIMARY KEY (user_id)
);