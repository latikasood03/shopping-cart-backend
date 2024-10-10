const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');

const stripe = require('stripe')('sk_test_51PxK8IBlNf9eVVqTBRqKvZBDbcq9jEYjvnoVO9l1N2mhnfWKx6pWl96Difm9X0AgwNSf1PCZcEtovzcbXF9Yange007uOHmJwb')

exports.addProduct = async (req, res, next) => {
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;

    if(!title || !price || !description) {
        return res.status(400).json({message: "All fields are required"})
    }

    try {
        const product = new Product({
            title,
            price,
            description
        })

        const prod = await product.save();
        res.status(201).json({message: "New product added", prod: prod});
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    }
}

exports.getProducts = async (req, res, next) => {
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 6;
    try {
        const totalProducts = await Product.countDocuments();

        const products = await Product.find()
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            message: "Fetched products successfully", 
            products: products,
            currentPage: page,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
        })
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    }

}

exports.deleteProduct = async (req, res, next) => {
    const prodId = req.params.prodId;
    try {
        const product = await Product.findByIdAndDelete(prodId);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await User.updateMany(
            { 'cart.items.productId': prodId },  
            { $pull: { 'cart.items': { productId: prodId } } } 
        );

        await User.updateMany(
            { 'wishlist.items.productId': prodId },  
            { $pull: { 'wishlist.items': { productId: prodId } } } 
        );

        return res.status(200).json({
            message: 'Product deleted and removed from all user carts and wishlists',
            deletedProduct: product
        });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    }
}


exports.getCart = async (req, res, next) => {
    try {
      const user = await User.findById(req.userId).populate('cart.items.productId');
      const products = user.cart.items;
      
      res.status(200).json({message: "Cart fetched successfully", products: products})
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    }
  };

exports.postCart = async(req, res, next) => {
    const prodId = req.body.prodId;
    try {
        const product = await Product.findById(prodId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        const user = await User.findById(req.userId);
        const result = await user.addToCart(product);
        
        res.status(200).json({
        message: 'Product added to cart successfully',
        cart: user.cart
        });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    }
}

exports.removeProductFromCart = async (req,res,next) => {
    const prodId = req.params.prodId;
    try {
        const user = await User.findById(req.userId);
        const product = await Product.findById(prodId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await user.removeFromCart(prodId);
        res.status(200).json({
            message: 'Product removed from cart successfully',
            cart: user.cart
        });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    }
}

exports.cartQuantityUpdate = async (req, res, next) => {
    const prodId = req.params.prodId;
    const newQuantity = req.body.quantity;
    
    try {
        const user = await User.findById(req.userId);
        const cartItem = user.cart.items.find(item => item.productId.toString() === prodId.toString());

        if (!cartItem) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        cartItem.quantity = newQuantity;
        await user.save();

        await user.populate('cart.items.productId');
        res.status(200).json({ cart: user.cart });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    }
};


exports.getWishlist = async (req, res, next) => {
    try {
      const user = await User.findById(req.userId).populate('wishlist.items.productId');
      const products = user.wishlist.items;
      
      res.status(200).json({message: "Wishlist items fetched successfully", products: products})
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    }
  };

exports.postWishlist = async(req, res, next) => {
    const prodId = req.body.prodId;
    try {
        const product = await Product.findById(prodId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        const user = await User.findById(req.userId);
        await user.addToWishlist(product);
        
        res.status(200).json({
        message: 'Product added to wishlist successfully',
        wishlist: user.wishlist
        });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    }
}

exports.removeProductFromWishlist = async (req, res, next) => {
    const prodId = req.params.prodId;
    try {
        const user = await User.findById(req.userId);
        const product = await Product.findById(prodId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await user.removeFromWishlist(prodId);
        res.status(200).json({
            message: 'Product removed from wishlist successfully',
            wishlist: user.wishlist
        });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    }
}

exports.getCheckout = async(req, res, next) => {
    try {
        const user = await User.findById(req.userId).populate('cart.items.productId');
        const products = user.cart.items;

        let total = 0;

        products.forEach(p => {
            total += p.quantity * p.productId.price;
        })

        const session = await stripe.checkout.sessions.create({
            line_items: products.map(p => ({
                price_data :{
                    currency: 'usd',
                    product_data: {
                        name: p.productId.title,
                        description: p.productId.description,
                    },
                    unit_amount: p.productId.price * 100,
                },
                quantity: p.quantity,
            })),
            mode: 'payment',
            payment_method_types: ['card'],
            success_url: 'https://shopping-cart-zlcb.onrender.com/checkout/success?sessionId={CHECKOUT_SESSION_ID}',
        })

        res.status(200).json({
            message: 'Checkout successful',
            products: products,
            totalSum: total,
            sessionId: session.id
        })
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    }
}

exports.getCheckoutSuccess = async (req, res, next) => {
    try {

    const sessionId = req.params.sessionId;
    const existingOrder = await Order.findOne({ 'payment.sessionId': sessionId });

    if (existingOrder) {
        return res.status(200).json({ message: "Order already processed" });
    }

    const user = await User.findById(req.userId).populate('cart.items.productId');

    if (user.cart.items.length === 0) {
        return res.status(400).json({ message: "No items in the cart to place an order." });
    }

    const products = user.cart.items.map(i => ({
        quantity: i.quantity,
        product: { ...i.productId._doc }
    }));

      const order = new Order({
        user: {
          email: user.email,
          userId: user._id
        },
        products: products,
        payment: {
            sessionId: sessionId  
        }
      });
  
      await order.save();
  
      await user.clearCart();
  
      res.status(200).json({ message: "Order placed successfully" });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };
  
  