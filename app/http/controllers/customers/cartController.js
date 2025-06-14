function cartController() {
    return {
        index(req, res) {
            res.render('customers/cart');
        },

        update(req, res) {
            const { _id, name, price, size, image, action } = req.body;

            // cart initialization
            if (!req.session.cart) {
                req.session.cart = {
                    items: {},
                    totalQty: 0,
                    totalPrice: 0
                };
            }

            const cart = req.session.cart;

            // Get current item or initialize if not exists
            let cartItem = cart.items[_id];

            if (action === 'increase') {
                if (!cartItem) {
                    cart.items[_id] = {
                        item: { _id, name, price, size, image },
                        qty: 1
                    };
                } else {
                    cart.items[_id].qty += 1;
                }

                cart.totalQty += 1;
                cart.totalPrice += price;
            }

            if (action === 'decrease' && cartItem) {
                cartItem.qty -= 1;
                cart.totalQty -= 1;
                cart.totalPrice -= price;

                if (cartItem.qty <= 0) {
                    delete cart.items[_id];
                }
            }

            return res.json({
                totalQty: cart.totalQty,
                totalPrice: cart.totalPrice,
                items: cart.items
            });
        }
    }
}

module.exports = cartController;