const FavoritesService = {
    getAllFavorites(knex, id) {
        return knex
            .select('*')
            .where('user_id', id)
            .from('permitful_favorites')
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
        return knex
            .from('permitful_favorites')
            .select('*')
            .where('permit_number', id)
            .first()
    },
    deleteFavorite(knex, id) {
        return knex('permitful_favorites')
            .where('permit_number', id)
            .delete()
    },
};

module.exports = FavoritesService;