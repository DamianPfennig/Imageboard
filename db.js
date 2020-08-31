const spicedPg = require('spiced-pg');

let db = spicedPg(
    'postgres:postgres:postgres@localhost:5432/imageboard'
);

module.exports.getImages = () => {
    return db.query(`
    SELECT * FROM images
    ORDER BY id DESC
    LIMIT 3
    `);
};

module.exports.addImages = (title, description, username, url) => {
    return db.query(`
    INSERT INTO images (title, description, username, url)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
        [title, description, username, url]
    );
};

module.exports.getSelectedImage = (userId) => {
    return db.query(`
    SELECT * FROM images
    WHERE id = ${userId}
    `)
};

module.exports.addComment = (comment, username, imageId) => {
    return db.query(`
        INSERT INTO comments (comment, username, image_id)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [comment, username, imageId])
};

module.exports.getComment = (imageId) => {
    return db.query(`
    SELECT comment, username, created_at 
    FROM comments
    WHERE image_id = ${imageId}
    `)
};

module.exports.getMoreImages = lastId => {
    return db.query(
        `SELECT * , (
              SELECT id FROM images
              ORDER BY id ASC
              LIMIT 1) AS "lowestId" 
      FROM images
      WHERE id < $1
      ORDER BY id DESC
      LIMIT 3`,
        [lastId]
    ).then(
        ({ rows }) => rows
    );
};