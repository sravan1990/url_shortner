const Joi = require('joi');
const db = require('./connection');

const urls = db.get('urls');

const schema = Joi.object().keys({
    name: Joi.string().token().min(1).max(6).required(),
    views: Joi.number(),
    created: Joi.date().default(new Date()),
    url: Joi.string().uri({
        scheme: [
            /https?/
        ]
    }).required()
}).with('name', 'url');

function find(name) {
    return urls.findOne({
        name
    });
}

/**
 *
 * @param urlname
 * @returns {Promise<T | undefined> | void}
 */
function findOneByUrl(url) {
    return urls.findOne({
        url
    });
}

/**
 *
 * @param almostPuny e.g { url: 'http://example.com', name: 'super-catchy'}
 * @returns {Promise<*>}
 */
async function create(almostPuny) {
    almostPuny.views = 0;
    almostPuny.created = new Date();
    const result = Joi.validate(almostPuny, schema);
    // result.error === null
    if (result.error === null) {
        const url = await urls.findOne({
            name: almostPuny.name
        });
        if (!url) {
            return urls.insert(almostPuny);
        } else {
            return Promise.reject({
                isJoi: true,
                details: [{
                    message: 'Short name is in use.'
                }]
            });
        }
    } else {
        return Promise.reject(result.error);
    }
}

/**
 *
 * @param puny
 * @returns {Promise<{ok: 1 | 0; nModified: number; n: number} | IDBValidKey | void>}
 */
async function increaseViews(puny) {
    return await urls.update(
        {_id: puny._id},
        {$inc: {views: 1}}
    )
}

module.exports = {
    create,
    find,
    increaseViews,
    findOneByUrl
};