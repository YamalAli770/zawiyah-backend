const express = require('express');
const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Product = require('../models/Product');

// Get cart by user ID
const getCartByUserId = asyncHandler(async (req, res) => {
    const id = req.params.id;
    
    const cart = await Cart.findOne({ cartOwner: id });
  
    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }
  
    res.status(200).json(cart);
  });
  
  // Add item to cart
  const addItemToCart = asyncHandler(async (req, res) => {
    const { id, productId } = req.body;
  
    const cart = await Cart.findOne({ cartOwner: id });
  
    if (!cart) {
      // Create a new cart if it doesn't exist
      const newCart = await Cart.create({
        cartItems: [productId],
        cartOwner: id,
        cartTotal: 0
      });
      res.status(201).json(newCart);
    } else {
      // Check if the product is already in the cart
      if (cart.cartItems.includes(productId)) {
        res.status(200);
        throw new Error('Product is already in the cart');
      }
  
      // Add the product to the existing cart
      cart.cartItems.push(productId);
      const cartTotal = await calculateCartTotal(cart.cartItems);
      cart.cartTotal = cartTotal;
      await cart.save();
      res.json(cart);
    }
  });
  
  // Remove item from cart
  const removeItemFromCart = asyncHandler(async (req, res) => {
    const { userId, productId } = req.body;
  
    const cart = await Cart.findOne({ cartOwner: userId });
  
    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }
  
    const index = cart.cartItems.indexOf(productId);
    if (index > -1) {
      cart.cartItems.splice(index, 1);
      await cart.save();
    }

    const cartTotal = calculateCartTotal(cart.cartItems);

    cart.cartTotal = cartTotal;
    await cart.save();
  
    res.json(cart);
  });
  
  // Clear cart
  const clearCart = asyncHandler(async (req, res) => {
    const username = req.params.username;

    console.log(username);

    const user = await User.findOne({ username });

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const id = user._id;
  
    const cart = await Cart.findOne({ cartOwner: id });
  
    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }
  
    cart.cartItems = [];
    cart.cartTotal = 0;
    await cart.save();
  
    res.json(cart);
  });

const calculateCartTotal = async (cartItems) => {
  let total = 0;

  if(!cartItems) return total;

  const products = await Product.find({ _id: { $in: cartItems } });

  products.forEach((product) => {
    total += product.currentPrice;
  });

  return total;
};
  
  module.exports = {
    getCartByUserId,
    addItemToCart,
    removeItemFromCart,
    clearCart
  };        