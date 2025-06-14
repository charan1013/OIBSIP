const Order = require('../../../models/order');
const moment = require('moment');
const stripeSecretKey = process.env.STRIPE_PRIVATE_KEY;

if (!stripeSecretKey) {
    throw new Error('STRIPE_PRIVATE_KEY is not defined in environment variables');
}

const stripe = require('stripe')(stripeSecretKey);

function orderController() {
    return {
        async store(req, res) {
            const { phone, address, stripeToken, paymentType } = req.body;

            // Basic validations
            if (!phone || !address) {
                return res.status(422).json({ message: 'All fields are required' });
            }

            if (!req.session.cart || !req.session.cart.items) {
                return res.status(400).json({ message: 'Cart is empty' });
            }

            // Create order
            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone,
                address
            });

            try {
                const result = await order.save();
                const placedOrder = await Order.populate(result, { path: 'customerId' });

                if (paymentType === 'card') {
                    try {
                        await stripe.charges.create({
                            amount: req.session.cart.totalPrice * 100,
                            source: stripeToken,
                            currency: 'inr',
                            description: `Pizza order: ${placedOrder._id}`,
                        });

                        placedOrder.paymentStatus = true;
                        placedOrder.paymentType = paymentType;
                        const ord = await placedOrder.save();

                        const eventEmitter = req.app.get('eventEmitter');
                        eventEmitter.emit('orderPlaced', ord);
                        delete req.session.cart;

                        return res.json({ message: 'Payment successful, Order placed successfully' });

                    } catch (stripeError) {
                        console.error('Stripe Error:', stripeError);

                        delete req.session.cart;
                        return res.json({ message: 'Order placed but payment failed. You can pay on delivery' });
                    }

                } else {
                    // COD or UPI flow
                    const eventEmitter = req.app.get('eventEmitter');
                    eventEmitter.emit('orderPlaced', placedOrder);
                    delete req.session.cart;

                    return res.json({ message: 'Order placed successfully' });
                }

            } catch (err) {
                console.error('Order Save Error:', err);
                return res.status(500).json({ message: 'Something went wrong' });
            }
        },

        async index(req, res) {
            try {
                const orders = await Order.find(
                    { customerId: req.user._id },
                    null,
                    { sort: { createdAt: -1 } }
                )
                .populate('customerId','name');
            
                res.header('Cache-Control', 'no-store');
                return res.render('customers/orders', { orders, moment });
            } catch (err) {
                console.error('Orders Fetch Error:', err);
                return res.redirect('/');
            }
        },

        async show(req, res) {
            try {
                const order = await Order.findById(req.params.id);
                if (req.user._id.toString() === order.customerId.toString()) {
                    return res.render('customers/singleOrder', { order });
                }
                return res.redirect('/');
            } catch (err) {
                console.error('Single Order Fetch Error:', err);
                return res.redirect('/');
            }
        },
    };
}

module.exports = orderController;
