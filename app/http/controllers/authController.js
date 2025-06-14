const User = require('../../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');

function authController() {
    const _getRedirectUrl = (req) => {
        return req.user.role === 'admin' ? '/admin/orders' : '/customer/orders';
    };

    return {
        login(req, res) {
            res.render('auth/login');
        },

        postLogin(req, res, next) {
            const { email, password } = req.body;

            
            const existingCart = req.session.cart;

            
            if (!email || !password) {
                req.flash('error', 'All fields are required');
                return res.redirect('/login');
            }

            passport.authenticate('local', (err, user, info) => {
                if (err) {
                    req.flash('error', info.message || 'Authentication error');
                    return next(err);
                }
                if (!user) {
                    req.flash('error', info.message || 'Invalid credentials');
                    return res.redirect('/login');
                }

                req.logIn(user, (err) => {
                    if (err) {
                        req.flash('error', info.message || 'Login failed');
                        return next(err);
                    }

                    
                    if (existingCart) {
                        req.session.cart = existingCart;
                    }

                
                    req.flash('success', 'Login successful!');
                    return res.redirect(_getRedirectUrl(req));
                });
            })(req, res, next);
        },

        register(req, res) {
            res.render('auth/register');
        },

        async postRegister(req, res) {
            const { name, email, password } = req.body;

            // Validate request
            if (!name || !email || !password) {
                req.flash('error', 'All fields are required');
                req.flash('name', name);
                req.flash('email', email);
                return res.redirect('/register');
            }

            try {
                const userExists = await User.exists({ email: email });
                if (userExists) {
                    req.flash('error', 'Email already taken');
                    req.flash('name', name);
                    req.flash('email', email);
                    return res.redirect('/register');
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create user
                const user = new User({
                    name,
                    email,
                    password: hashedPassword
                });

                await user.save();

               
                req.flash('success', 'Registration successful! You can now log in.');
                return res.redirect('/login');

            } catch (err) {
                console.error(err);
                req.flash('error', 'Something went wrong');
                return res.redirect('/register');
            }
        },

        logout(req, res, next) {
            req.logout(function(err) {
                if (err) {
                    return next(err);
                }
                req.flash('success', 'Logged out successfully.');
                return res.redirect('/login');
            });
        }
    };
}

module.exports = authController;
