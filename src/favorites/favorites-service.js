const FavoritesService = {
    getAllFavorites(knex) {
        return knex.select('*').from('permitful_favorites')
    },
    insertFavorite(knex, newFavorite) {
        return knex 
            .insert(newFavorite)
            .into('permitful_favorites')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex.from('permitful_favorites').select('*').where('permit_number', id).first()
    },
    deleteFavorite(knex, id) {
        return knex('permitful_favorties')
            .where({ id })
            .delete()
    },
};

module.exports = FavoritesService;