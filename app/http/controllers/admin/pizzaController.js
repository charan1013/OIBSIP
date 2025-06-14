const Menu = require('../../../models/menu')

function pizzaController() {
    return {
        addPizzaPage(req, res) {
            res.render('admin/addpizza')
        },

        async addPizza(req, res) {
            const { name, price, size } = req.body
            const image = req.file ? req.file.filename : null  

            if (!name || !price || !size || !image) {
                return res.render('admin/addpizza', { error: 'All fields are required' })
            }

            try {
                const newPizza = new Menu({ name, price, size, image })
                await newPizza.save()
                return res.render('admin/addpizza', { success: 'Pizza added successfully' })
            } catch (err) {
                console.error(err)
                return res.render('admin/addpizza', { error: 'Something went wrong' })
            }
        }
    }
}

module.exports = pizzaController
