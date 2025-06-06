const Order = require('../../../models/order')
const moment = require('moment')

function orderController () {
    return {
        async store(req, res) {
            const { phone, address, paymentType } = req.body
            if (!phone || !address) {
                return res.status(422).json({ message: 'All fields are required' })
            }

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone,
                address
            })

            try {
                const result = await order.save()
                const placedOrder = await Order.populate(result, { path: 'customerId' })

                // Emit event
                const eventEmitter = req.app.get('eventEmitter')
                eventEmitter.emit('orderPlaced', placedOrder)

                delete req.session.cart
                return res.json({ message: 'Order placed successfully' })
            } catch (err) {
                console.log(err)
                return res.status(500).json({ message: 'Something went wrong' })
            }
        },

        async index(req, res) {
            try {
                const orders = await Order.find({ customerId: req.user._id }, null, {
                    sort: { createdAt: -1 }
                })
                res.header('Cache-Control', 'no-store')
                return res.render('customers/orders', { orders, moment })
            } catch (err) {
                return res.redirect('/')
            }
        },

        async show(req, res) {
            try {
                const order = await Order.findById(req.params.id)
                if (req.user._id.toString() === order.customerId.toString()) {
                    return res.render('customers/singleOrder', { order })
                }
                return res.redirect('/')
            } catch (err) {
                return res.redirect('/')
            }
        }
    }
}

module.exports = orderController
